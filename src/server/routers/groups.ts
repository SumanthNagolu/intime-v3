import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// =============================================================================
// SCHEMAS
// =============================================================================

const groupTypeSchema = z.enum([
  'root',
  'division',
  'branch',
  'team',
  'satellite_office',
  'producer',
])

const loadPermissionSchema = z.enum(['normal', 'reduced', 'exempt'])
const vacationStatusSchema = z.enum(['available', 'vacation', 'sick', 'leave'])

// =============================================================================
// ROUTER
// =============================================================================

export const groupsRouter = router({
  // ============================================
  // LIST GROUPS FOR TREE (Sidebar navigation)
  // ============================================
  listForTree: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx
    const adminClient = getAdminClient()

    // Get groups with hierarchy info and member counts for tree display
    const { data: groups, error } = await adminClient
      .from('groups')
      .select(`
        id,
        name,
        code,
        group_type,
        parent_group_id,
        hierarchy_level,
        hierarchy_path,
        is_active,
        group_members(count)
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('hierarchy_level', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return {
      groups: (groups ?? []).map(group => ({
        id: group.id,
        name: group.name,
        code: group.code,
        groupType: group.group_type,
        parentGroupId: group.parent_group_id,
        hierarchyLevel: group.hierarchy_level ?? 0,
        hierarchyPath: group.hierarchy_path,
        isActive: group.is_active,
        _count: {
          members: Array.isArray(group.group_members) && group.group_members[0]
            ? (group.group_members[0] as { count: number }).count || 0
            : 0
        }
      }))
    }
  }),

  // ============================================
  // LIST GROUPS (Search/filter with pagination)
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      groupType: groupTypeSchema.optional(),
      parentGroupId: z.string().uuid().nullable().optional(),
      isActive: z.boolean().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const { search, groupType, parentGroupId, isActive, page, pageSize } = input
      const offset = (page - 1) * pageSize

      let query = adminClient
        .from('groups')
        .select(`
          *,
          supervisor:user_profiles!groups_supervisor_id_fkey(id, full_name, email, avatar_url),
          manager:user_profiles!groups_manager_id_fkey(id, full_name, email, avatar_url),
          group_members(count),
          group_regions(count)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)
      }
      if (groupType) {
        query = query.eq('group_type', groupType)
      }
      if (parentGroupId !== undefined) {
        if (parentGroupId === null) {
          query = query.is('parent_group_id', null)
        } else {
          query = query.eq('parent_group_id', parentGroupId)
        }
      }
      if (isActive !== undefined) {
        query = query.eq('is_active', isActive)
      }

      // Pagination
      query = query
        .order('hierarchy_level', { ascending: true })
        .order('name', { ascending: true })
        .range(offset, offset + pageSize - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      type GroupMemberCount = { count: number }
      type GroupRegionCount = { count: number }

      const items = (data ?? []).map(group => ({
        ...group,
        groupType: group.group_type,
        parentGroupId: group.parent_group_id,
        hierarchyLevel: group.hierarchy_level,
        hierarchyPath: group.hierarchy_path,
        securityZone: group.security_zone,
        isActive: group.is_active,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        parent: null, // Will be populated separately if needed
        memberCount: Array.isArray(group.group_members) && group.group_members[0]
          ? (group.group_members[0] as GroupMemberCount).count || 0
          : 0,
        regionCount: Array.isArray(group.group_regions) && group.group_regions[0]
          ? (group.group_regions[0] as GroupRegionCount).count || 0
          : 0,
      }))

      return {
        items,
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // ============================================
  // GET GROUP BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: group, error } = await adminClient
        .from('groups')
        .select(`
          *,
          supervisor:user_profiles!groups_supervisor_id_fkey(id, full_name, email, avatar_url),
          manager:user_profiles!groups_manager_id_fkey(id, full_name, email, avatar_url),
          created_by_user:user_profiles!groups_created_by_fkey(id, full_name),
          members:group_members(
            id,
            user_id,
            is_manager,
            is_active,
            load_factor,
            load_permission,
            vacation_status,
            backup_user_id,
            joined_at,
            left_at,
            user:user_profiles!group_members_user_id_fkey(id, full_name, email, avatar_url, role_id)
          ),
          regions:group_regions(
            id,
            region_id,
            is_primary,
            is_active,
            region:regions(id, name, code)
          )
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !group) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        })
      }

      // Fetch parent group separately to avoid self-referential join issue
      let parent = null
      if (group.parent_group_id) {
        const { data: parentData } = await adminClient
          .from('groups')
          .select('id, name, group_type')
          .eq('id', group.parent_group_id)
          .single()
        parent = parentData
      }

      return {
        id: group.id,
        name: group.name,
        code: group.code,
        description: group.description,
        groupType: group.group_type,
        parentGroupId: group.parent_group_id,
        hierarchyLevel: group.hierarchy_level,
        hierarchyPath: group.hierarchy_path,
        securityZone: group.security_zone,
        supervisorId: group.supervisor_id,
        managerId: group.manager_id,
        loadFactor: group.load_factor,
        isActive: group.is_active,
        phone: group.phone,
        fax: group.fax,
        email: group.email,
        address_line1: group.address_line1,
        address_line2: group.address_line2,
        city: group.city,
        state: group.state,
        postal_code: group.postal_code,
        country: group.country,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        // Relations (for reference, but EditGroupClient doesn't use them)
        parent,
        supervisor: Array.isArray(group.supervisor) ? group.supervisor[0] : group.supervisor,
        manager: Array.isArray(group.manager) ? group.manager[0] : group.manager,
        created_by_user: Array.isArray(group.created_by_user) ? group.created_by_user[0] : group.created_by_user,
        members: group.members || [],
        regions: group.regions || [],
      }
    }),

  // ============================================
  // GET FULL GROUP (Single DB call with all data)
  // ============================================
  getFullGroup: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Execute queries in parallel
      const [groupResult, childrenResult] = await Promise.all([
        // Main group data with relations
        adminClient
          .from('groups')
          .select(`
            *,
            supervisor:user_profiles!groups_supervisor_id_fkey(id, full_name, email, avatar_url),
            manager:user_profiles!groups_manager_id_fkey(id, full_name, email, avatar_url),
            created_by_user:user_profiles!groups_created_by_fkey(id, full_name),
            members:group_members(
              id,
              user_id,
              is_manager,
              is_active,
              load_factor,
              load_permission,
              vacation_status,
              backup_user_id,
              joined_at,
              left_at,
              user:user_profiles!group_members_user_id_fkey(id, full_name, email, avatar_url, role_id)
            ),
            regions:group_regions(
              id,
              region_id,
              is_primary,
              is_active,
              region:regions(id, name, code)
            )
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single(),

        // Child groups
        adminClient
          .from('groups')
          .select('id, name, group_type, is_active, group_members(count)')
          .eq('org_id', orgId)
          .eq('parent_group_id', input.id)
          .is('deleted_at', null)
          .order('name'),
      ])

      if (groupResult.error || !groupResult.data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        })
      }

      const group = groupResult.data

      // Fetch parent group separately to avoid self-referential join issue
      let parent = null
      if (group.parent_group_id) {
        const { data: parentData } = await adminClient
          .from('groups')
          .select('id, name, group_type')
          .eq('id', group.parent_group_id)
          .single()
        parent = parentData
      }

      return {
        ...group,
        parent,
        groupType: group.group_type,
        parentGroupId: group.parent_group_id,
        hierarchyLevel: group.hierarchy_level,
        hierarchyPath: group.hierarchy_path,
        securityZone: group.security_zone,
        supervisorId: group.supervisor_id,
        managerId: group.manager_id,
        loadFactor: group.load_factor,
        isActive: group.is_active,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        sections: {
          children: {
            items: childrenResult.data ?? [],
            total: childrenResult.data?.length ?? 0,
          },
          activity: {
            // Activity logs are stored in partitioned tables - skip for now
            items: [],
            total: 0,
          },
        },
      }
    }),

  // ============================================
  // CREATE GROUP
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100),
      code: z.string().max(50).optional(),
      description: z.string().optional(),
      groupType: groupTypeSchema.default('team'),
      parentGroupId: z.string().uuid().optional(),
      supervisorId: z.string().uuid().optional(),
      managerId: z.string().uuid().optional(),
      securityZone: z.string().optional(),
      phone: z.string().optional(),
      fax: z.string().optional(),
      email: z.string().email().optional(),
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().default('USA'),
      loadFactor: z.number().min(0).max(200).default(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get the user_profile.id for the current user
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Validate parent group exists and belongs to same org
      if (input.parentGroupId) {
        const { data: parent, error: parentError } = await adminClient
          .from('groups')
          .select('id, org_id')
          .eq('id', input.parentGroupId)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (parentError || !parent) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Parent group not found',
          })
        }
      }

      // Check for duplicate name in same parent
      const { data: existing } = await adminClient
        .from('groups')
        .select('id')
        .eq('org_id', orgId)
        .eq('name', input.name)
        .is('deleted_at', null)
        .maybeSingle()

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A group with this name already exists',
        })
      }

      // Don't allow creating root groups manually
      if (input.groupType === 'root') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Root groups are created automatically for each organization',
        })
      }

      // Create the group
      const { data: group, error: createError } = await adminClient
        .from('groups')
        .insert({
          org_id: orgId,
          name: input.name,
          code: input.code,
          description: input.description,
          group_type: input.groupType,
          parent_group_id: input.parentGroupId,
          supervisor_id: input.supervisorId,
          manager_id: input.managerId,
          security_zone: input.securityZone ?? 'default',
          phone: input.phone,
          fax: input.fax,
          email: input.email,
          address_line1: input.addressLine1,
          address_line2: input.addressLine2,
          city: input.city,
          state: input.state,
          postal_code: input.postalCode,
          country: input.country,
          load_factor: input.loadFactor,
          is_active: true,
          created_by: userProfileId,
        })
        .select()
        .single()

      if (createError || !group) {
        console.error('Failed to create group:', createError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create group',
        })
      }

      // Create audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: userProfileId,
        user_email: user?.email,
        action: 'create',
        table_name: 'groups',
        record_id: group.id,
        new_values: group,
      })

      return group
    }),

  // ============================================
  // UPDATE GROUP
  // ============================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(2).max(100).optional(),
      code: z.string().max(50).optional(),
      description: z.string().optional(),
      groupType: groupTypeSchema.optional(),
      parentGroupId: z.string().uuid().nullable().optional(),
      supervisorId: z.string().uuid().nullable().optional(),
      managerId: z.string().uuid().nullable().optional(),
      securityZone: z.string().optional(),
      phone: z.string().optional(),
      fax: z.string().optional(),
      email: z.string().email().nullable().optional(),
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      loadFactor: z.number().min(0).max(200).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const { id, ...updateData } = input

      // Get the user_profile.id
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Get current group
      const { data: currentGroup, error: fetchError } = await adminClient
        .from('groups')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !currentGroup) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        })
      }

      // Don't allow changing root group type
      if (currentGroup.group_type === 'root' && updateData.groupType && updateData.groupType !== 'root') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot change the type of a root group',
        })
      }

      // Check for duplicate name if being changed
      if (updateData.name && updateData.name !== currentGroup.name) {
        const { data: existing } = await adminClient
          .from('groups')
          .select('id')
          .eq('org_id', orgId)
          .eq('name', updateData.name)
          .neq('id', id)
          .is('deleted_at', null)
          .maybeSingle()

        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A group with this name already exists',
          })
        }
      }

      // Validate parent group if being changed
      if (updateData.parentGroupId !== undefined && updateData.parentGroupId !== null) {
        // Prevent circular reference
        if (updateData.parentGroupId === id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A group cannot be its own parent',
          })
        }

        const { data: parent, error: parentError } = await adminClient
          .from('groups')
          .select('id, hierarchy_path')
          .eq('id', updateData.parentGroupId)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (parentError || !parent) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Parent group not found',
          })
        }

        // Check for circular reference in hierarchy
        if (parent.hierarchy_path?.includes(id)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot set a descendant group as parent (circular reference)',
          })
        }
      }

      // Build update object with snake_case keys
      const updates: Record<string, unknown> = { updated_by: userProfileId }
      if (updateData.name !== undefined) updates.name = updateData.name
      if (updateData.code !== undefined) updates.code = updateData.code
      if (updateData.description !== undefined) updates.description = updateData.description
      if (updateData.groupType !== undefined) updates.group_type = updateData.groupType
      if (updateData.parentGroupId !== undefined) updates.parent_group_id = updateData.parentGroupId
      if (updateData.supervisorId !== undefined) updates.supervisor_id = updateData.supervisorId
      if (updateData.managerId !== undefined) updates.manager_id = updateData.managerId
      if (updateData.securityZone !== undefined) updates.security_zone = updateData.securityZone
      if (updateData.phone !== undefined) updates.phone = updateData.phone
      if (updateData.fax !== undefined) updates.fax = updateData.fax
      if (updateData.email !== undefined) updates.email = updateData.email
      if (updateData.addressLine1 !== undefined) updates.address_line1 = updateData.addressLine1
      if (updateData.addressLine2 !== undefined) updates.address_line2 = updateData.addressLine2
      if (updateData.city !== undefined) updates.city = updateData.city
      if (updateData.state !== undefined) updates.state = updateData.state
      if (updateData.postalCode !== undefined) updates.postal_code = updateData.postalCode
      if (updateData.country !== undefined) updates.country = updateData.country
      if (updateData.loadFactor !== undefined) updates.load_factor = updateData.loadFactor
      if (updateData.isActive !== undefined) updates.is_active = updateData.isActive

      // Update the group
      const { data: group, error: updateError } = await adminClient
        .from('groups')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !group) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update group',
        })
      }

      // Create audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: userProfileId,
        user_email: user?.email,
        action: 'update',
        table_name: 'groups',
        record_id: group.id,
        old_values: currentGroup,
        new_values: group,
      })

      return group
    }),

  // ============================================
  // DELETE GROUP (soft delete)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reassignToGroupId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get the user_profile.id
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Get group with members and children
      const { data: group, error: fetchError } = await adminClient
        .from('groups')
        .select(`
          *,
          members:group_members(id, user_id, is_active),
          children:groups!groups_parent_group_id_fkey(id)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !group) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        })
      }

      // Cannot delete root group
      if (group.group_type === 'root') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete the root group. Delete the organization instead.',
        })
      }

      // Check for child groups
      if (group.children && group.children.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete group with ${group.children.length} child group(s). Move or delete child groups first.`,
        })
      }

      type GroupMember = { id: string; user_id: string; is_active: boolean }
      const activeMembers = (group.members as GroupMember[])?.filter((m) => m.is_active) ?? []

      // If group has active members and no reassignment target, error
      if (activeMembers.length > 0 && !input.reassignToGroupId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Group has ${activeMembers.length} active member(s). Please reassign them first or specify a group to transfer them to.`,
        })
      }

      // Transfer members if reassignment target provided
      if (activeMembers.length > 0 && input.reassignToGroupId) {
        const userIds = activeMembers.map((m) => m.user_id)

        // Deactivate in current group
        await adminClient
          .from('group_members')
          .update({
            is_active: false,
            left_at: new Date().toISOString(),
          })
          .eq('group_id', input.id)
          .eq('is_active', true)

        // Add to new group
        const memberInserts = userIds.map((userId: string) => ({
          org_id: orgId,
          group_id: input.reassignToGroupId,
          user_id: userId,
          is_manager: false,
          is_active: true,
          created_by: userProfileId,
        }))

        await adminClient.from('group_members').insert(memberInserts)
      }

      // Soft delete the group
      const { data: deleted, error: deleteError } = await adminClient
        .from('groups')
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false,
          updated_by: userProfileId,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (deleteError || !deleted) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete group',
        })
      }

      // Create audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: userProfileId,
        user_email: user?.email,
        action: 'delete',
        table_name: 'groups',
        record_id: input.id,
        old_values: group,
      })

      return { success: true, transferred: activeMembers.length }
    }),

  // ============================================
  // ADD MEMBERS TO GROUP
  // ============================================
  addMembers: orgProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      members: z.array(z.object({
        userId: z.string().uuid(),
        isManager: z.boolean().default(false),
        loadFactor: z.number().min(0).max(200).default(100),
        loadPermission: loadPermissionSchema.default('normal'),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get the user_profile.id
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Verify group exists
      const { data: group, error: groupError } = await adminClient
        .from('groups')
        .select('id')
        .eq('id', input.groupId)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (groupError || !group) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        })
      }

      // Check for existing members
      const userIds = input.members.map(m => m.userId)
      const { data: existingMembers } = await adminClient
        .from('group_members')
        .select('user_id')
        .eq('group_id', input.groupId)
        .in('user_id', userIds)
        .eq('is_active', true)

      const existingUserIds = new Set(existingMembers?.map(m => m.user_id) ?? [])
      const newMembers = input.members.filter(m => !existingUserIds.has(m.userId))

      if (newMembers.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'All specified users are already members of this group',
        })
      }

      // Insert new members
      const memberInserts = newMembers.map(member => ({
        org_id: orgId,
        group_id: input.groupId,
        user_id: member.userId,
        is_manager: member.isManager,
        load_factor: member.loadFactor,
        load_permission: member.loadPermission,
        is_active: true,
        created_by: userProfileId,
      }))

      const { data: members, error: insertError } = await adminClient
        .from('group_members')
        .insert(memberInserts)
        .select()

      if (insertError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add members',
        })
      }

      // Create audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: userProfileId,
        user_email: user?.email,
        action: 'add_members',
        table_name: 'group_members',
        record_id: input.groupId,
        new_values: { added_members: newMembers },
      })

      return { added: members?.length ?? 0, skipped: existingUserIds.size }
    }),

  // ============================================
  // REMOVE MEMBERS FROM GROUP
  // ============================================
  removeMembers: orgProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      userIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get the user_profile.id
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Soft delete members
      const { data: removed, error } = await adminClient
        .from('group_members')
        .update({
          is_active: false,
          left_at: new Date().toISOString(),
        })
        .eq('group_id', input.groupId)
        .in('user_id', input.userIds)
        .eq('is_active', true)
        .select()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove members',
        })
      }

      // Create audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: userProfileId,
        user_email: user?.email,
        action: 'remove_members',
        table_name: 'group_members',
        record_id: input.groupId,
        old_values: { removed_user_ids: input.userIds },
      })

      return { removed: removed?.length ?? 0 }
    }),

  // ============================================
  // UPDATE MEMBER
  // ============================================
  updateMember: orgProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      userId: z.string().uuid(),
      isManager: z.boolean().optional(),
      loadFactor: z.number().min(0).max(200).optional(),
      loadPermission: loadPermissionSchema.optional(),
      vacationStatus: vacationStatusSchema.optional(),
      backupUserId: z.string().uuid().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const { groupId, userId, ...updateData } = input

      const updates: Record<string, unknown> = {}
      if (updateData.isManager !== undefined) updates.is_manager = updateData.isManager
      if (updateData.loadFactor !== undefined) updates.load_factor = updateData.loadFactor
      if (updateData.loadPermission !== undefined) updates.load_permission = updateData.loadPermission
      if (updateData.vacationStatus !== undefined) updates.vacation_status = updateData.vacationStatus
      if (updateData.backupUserId !== undefined) updates.backup_user_id = updateData.backupUserId

      const { data: member, error } = await adminClient
        .from('group_members')
        .update(updates)
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .select()
        .single()

      if (error || !member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      return member
    }),

  // ============================================
  // ASSIGN REGIONS TO GROUP
  // ============================================
  assignRegions: orgProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      regionIds: z.array(z.string().uuid()),
      primaryRegionId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get the user_profile.id
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Verify group exists
      const { data: group, error: groupError } = await adminClient
        .from('groups')
        .select('id')
        .eq('id', input.groupId)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (groupError || !group) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        })
      }

      // Get existing region assignments
      const { data: existingRegions } = await adminClient
        .from('group_regions')
        .select('region_id')
        .eq('group_id', input.groupId)

      const existingRegionIds = new Set(existingRegions?.map(r => r.region_id) ?? [])
      const newRegionIds = input.regionIds.filter(id => !existingRegionIds.has(id))

      // Insert new region assignments
      if (newRegionIds.length > 0) {
        const regionInserts = newRegionIds.map(regionId => ({
          org_id: orgId,
          group_id: input.groupId,
          region_id: regionId,
          is_primary: regionId === input.primaryRegionId,
          is_active: true,
          created_by: userProfileId,
        }))

        const { error: insertError } = await adminClient
          .from('group_regions')
          .insert(regionInserts)

        if (insertError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to assign regions',
          })
        }
      }

      // Update primary region if specified
      if (input.primaryRegionId) {
        // Clear existing primary
        await adminClient
          .from('group_regions')
          .update({ is_primary: false })
          .eq('group_id', input.groupId)
          .neq('region_id', input.primaryRegionId)

        // Set new primary
        await adminClient
          .from('group_regions')
          .update({ is_primary: true })
          .eq('group_id', input.groupId)
          .eq('region_id', input.primaryRegionId)
      }

      return { added: newRegionIds.length }
    }),

  // ============================================
  // REMOVE REGIONS FROM GROUP
  // ============================================
  removeRegions: orgProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      regionIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data: removed, error } = await adminClient
        .from('group_regions')
        .delete()
        .eq('group_id', input.groupId)
        .in('region_id', input.regionIds)
        .select()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove regions',
        })
      }

      return { removed: removed?.length ?? 0 }
    }),

  // ============================================
  // GET ROOT GROUP (for current org)
  // ============================================
  getRootGroup: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx
    const adminClient = getAdminClient()

    const { data: rootGroup, error } = await adminClient
      .from('groups')
      .select('id, name, code, group_type')
      .eq('org_id', orgId)
      .eq('group_type', 'root')
      .is('deleted_at', null)
      .single()

    if (error || !rootGroup) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Root group not found. Please contact support.',
      })
    }

    return rootGroup
  }),

  // ============================================
  // GET AVAILABLE USERS (for member selection)
  // ============================================
  getAvailableUsers: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      excludeGroupId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, role_id')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('full_name')

      if (input.search) {
        query = query.or(`full_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
      }

      const { data: users, error } = await query.limit(50)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        })
      }

      return users ?? []
    }),

  // ============================================
  // GET AVAILABLE REGIONS (for region assignment)
  // ============================================
  getAvailableRegions: orgProtectedProcedure
    .input(z.object({
      excludeGroupId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: regions, error } = await adminClient
        .from('regions')
        .select('id, name, code')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch regions',
        })
      }

      return regions ?? []
    }),
})

