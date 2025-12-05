import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'

// Schema definitions
const systemSettingCategorySchema = z.enum(['general', 'security', 'email', 'files', 'api'])
const orgSettingCategorySchema = z.enum(['general', 'branding', 'localization', 'business', 'compliance'])
const brandingAssetTypeSchema = z.enum(['logo_light', 'logo_dark', 'favicon', 'login_background'])

export const settingsRouter = router({
  // ============================================
  // GET ORGANIZATION DETAILS
  // ============================================
  getOrganization: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      const { data: org, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (error || !org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      return org
    }),

  // ============================================
  // UPDATE ORGANIZATION
  // ============================================
  updateOrganization: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(2).max(200).optional(),
      legal_name: z.string().max(200).optional().nullable(),
      industry: z.string().max(100).optional().nullable(),
      company_size: z.string().max(50).optional().nullable(),
      website: z.string().url().optional().nullable().or(z.literal('')),
      email: z.string().email().optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      address_line1: z.string().max(255).optional().nullable(),
      address_line2: z.string().max(255).optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      state: z.string().max(100).optional().nullable(),
      postal_code: z.string().max(20).optional().nullable(),
      country: z.string().max(100).optional().nullable(),
      timezone: z.string().max(100).optional(),
      locale: z.string().max(20).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Get current org
      const { data: currentOrg, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (fetchError || !currentOrg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      // Build update object (only include defined values)
      const updates: Record<string, unknown> = {}
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          // Handle empty string for URL field
          if (key === 'website' && value === '') {
            updates[key] = null
          } else {
            updates[key] = value
          }
        }
      })

      if (Object.keys(updates).length === 0) {
        return currentOrg
      }

      // Update organization
      const { data: org, error: updateError } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', orgId)
        .select()
        .single()

      if (updateError || !org) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update organization',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'organizations',
        record_id: orgId,
        old_values: currentOrg,
        new_values: org,
      })

      return org
    }),

  // ============================================
  // GET SYSTEM SETTINGS
  // ============================================
  getSystemSettings: orgProtectedProcedure
    .input(z.object({
      category: systemSettingCategorySchema.optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      let query = supabase
        .from('system_settings')
        .select('*')
        .order('key')

      if (input?.category) {
        query = query.eq('category', input.category)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch system settings',
        })
      }

      return data ?? []
    }),

  // ============================================
  // UPDATE SYSTEM SETTING
  // ============================================
  updateSystemSetting: orgProtectedProcedure
    .input(z.object({
      key: z.string(),
      value: z.unknown(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Get current setting
      const { data: currentSetting, error: fetchError } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', input.key)
        .single()

      if (fetchError || !currentSetting) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `System setting "${input.key}" not found`,
        })
      }

      // Update setting
      const { data: setting, error: updateError } = await supabase
        .from('system_settings')
        .update({
          value: JSON.stringify(input.value),
          updated_by: user?.id,
        })
        .eq('key', input.key)
        .select()
        .single()

      if (updateError || !setting) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update system setting',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'system_settings',
        record_id: setting.id,
        old_values: { key: input.key, value: currentSetting.value },
        new_values: { key: input.key, value: setting.value },
      })

      return setting
    }),

  // ============================================
  // BULK UPDATE SYSTEM SETTINGS
  // ============================================
  bulkUpdateSystemSettings: orgProtectedProcedure
    .input(z.object({
      settings: z.array(z.object({
        key: z.string(),
        value: z.unknown(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const results = []
      const errors = []

      for (const setting of input.settings) {
        try {
          // Get current setting
          const { data: currentSetting } = await supabase
            .from('system_settings')
            .select('*')
            .eq('key', setting.key)
            .single()

          if (!currentSetting) {
            errors.push({ key: setting.key, error: 'Setting not found' })
            continue
          }

          // Update setting
          const { data: updated, error: updateError } = await supabase
            .from('system_settings')
            .update({
              value: JSON.stringify(setting.value),
              updated_by: user?.id,
            })
            .eq('key', setting.key)
            .select()
            .single()

          if (updateError || !updated) {
            errors.push({ key: setting.key, error: 'Failed to update' })
            continue
          }

          results.push(updated)

          // Create audit log
          await supabase.from('audit_logs').insert({
            org_id: orgId,
            user_id: user?.id,
            user_email: user?.email,
            action: 'update',
            table_name: 'system_settings',
            record_id: updated.id,
            old_values: { key: setting.key, value: currentSetting.value },
            new_values: { key: setting.key, value: updated.value },
          })
        } catch {
          errors.push({ key: setting.key, error: 'Unexpected error' })
        }
      }

      return { updated: results, errors }
    }),

  // ============================================
  // GET ORGANIZATION SETTINGS
  // ============================================
  getOrgSettings: orgProtectedProcedure
    .input(z.object({
      category: orgSettingCategorySchema.optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('organization_settings')
        .select('*')
        .eq('org_id', orgId)
        .order('key')

      if (input?.category) {
        query = query.eq('category', input.category)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch organization settings',
        })
      }

      return data ?? []
    }),

  // ============================================
  // UPDATE ORGANIZATION SETTING (UPSERT)
  // ============================================
  updateOrgSetting: orgProtectedProcedure
    .input(z.object({
      key: z.string(),
      value: z.unknown(),
      category: orgSettingCategorySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Get current setting if exists
      const { data: currentSetting } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('org_id', orgId)
        .eq('key', input.key)
        .single()

      // Upsert setting
      const { data: setting, error: upsertError } = await supabase
        .from('organization_settings')
        .upsert({
          org_id: orgId,
          key: input.key,
          value: JSON.stringify(input.value),
          category: input.category,
          updated_by: user?.id,
        }, {
          onConflict: 'org_id,key',
        })
        .select()
        .single()

      if (upsertError || !setting) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update organization setting',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: currentSetting ? 'update' : 'create',
        table_name: 'organization_settings',
        record_id: setting.id,
        old_values: currentSetting ? { key: input.key, value: currentSetting.value } : null,
        new_values: { key: input.key, value: setting.value },
      })

      return setting
    }),

  // ============================================
  // BULK UPDATE ORGANIZATION SETTINGS
  // ============================================
  bulkUpdateOrgSettings: orgProtectedProcedure
    .input(z.object({
      settings: z.array(z.object({
        key: z.string(),
        value: z.unknown(),
        category: orgSettingCategorySchema,
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const results = []
      const errors = []

      for (const setting of input.settings) {
        try {
          // Get current setting if exists
          const { data: currentSetting } = await supabase
            .from('organization_settings')
            .select('*')
            .eq('org_id', orgId)
            .eq('key', setting.key)
            .single()

          // Upsert setting
          const { data: updated, error: upsertError } = await supabase
            .from('organization_settings')
            .upsert({
              org_id: orgId,
              key: setting.key,
              value: JSON.stringify(setting.value),
              category: setting.category,
              updated_by: user?.id,
            }, {
              onConflict: 'org_id,key',
            })
            .select()
            .single()

          if (upsertError || !updated) {
            errors.push({ key: setting.key, error: 'Failed to update' })
            continue
          }

          results.push(updated)

          // Create audit log
          await supabase.from('audit_logs').insert({
            org_id: orgId,
            user_id: user?.id,
            user_email: user?.email,
            action: currentSetting ? 'update' : 'create',
            table_name: 'organization_settings',
            record_id: updated.id,
            old_values: currentSetting ? { key: setting.key, value: currentSetting.value } : null,
            new_values: { key: setting.key, value: updated.value },
          })
        } catch {
          errors.push({ key: setting.key, error: 'Unexpected error' })
        }
      }

      return { updated: results, errors }
    }),

  // ============================================
  // GET BRANDING ASSETS
  // ============================================
  getBranding: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      const { data: assets, error } = await supabase
        .from('organization_branding')
        .select('*')
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch branding assets',
        })
      }

      // Generate signed URLs for each asset
      const assetsWithUrls = await Promise.all(
        (assets ?? []).map(async (asset) => {
          const { data: signedUrl } = await supabase
            .storage
            .from('org-assets')
            .createSignedUrl(asset.storage_path, 3600) // 1 hour expiry

          return {
            ...asset,
            signed_url: signedUrl?.signedUrl ?? null,
          }
        })
      )

      return assetsWithUrls
    }),

  // ============================================
  // UPLOAD BRANDING ASSET
  // ============================================
  uploadBrandingAsset: orgProtectedProcedure
    .input(z.object({
      assetType: brandingAssetTypeSchema,
      fileBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Validate mime type
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp', 'image/x-icon']
      if (!allowedMimeTypes.includes(input.mimeType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid file type. Allowed types: PNG, JPEG, GIF, SVG, WebP, ICO',
        })
      }

      // Convert base64 to buffer
      const base64Data = input.fileBase64.replace(/^data:image\/\w+;base64,/, '')
      const fileBuffer = Buffer.from(base64Data, 'base64')

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024
      if (fileBuffer.length > maxSize) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File size exceeds 5MB limit',
        })
      }

      // Generate storage path
      const ext = input.fileName.split('.').pop() || 'png'
      const storagePath = `${orgId}/${input.assetType}.${ext}`

      // Delete existing asset if exists
      const { data: existing } = await supabase
        .from('organization_branding')
        .select('storage_path')
        .eq('org_id', orgId)
        .eq('asset_type', input.assetType)
        .single()

      if (existing) {
        await supabase.storage.from('org-assets').remove([existing.storage_path])
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('org-assets')
        .upload(storagePath, fileBuffer, {
          contentType: input.mimeType,
          upsert: true,
        })

      if (uploadError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to upload file: ${uploadError.message}`,
        })
      }

      // Upsert branding record
      const { data: asset, error: dbError } = await supabase
        .from('organization_branding')
        .upsert({
          org_id: orgId,
          asset_type: input.assetType,
          storage_path: storagePath,
          file_name: input.fileName,
          file_size: fileBuffer.length,
          mime_type: input.mimeType,
          uploaded_by: user?.id,
        }, {
          onConflict: 'org_id,asset_type',
        })
        .select()
        .single()

      if (dbError || !asset) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save branding asset record',
        })
      }

      // Get signed URL
      const { data: signedUrl } = await supabase
        .storage
        .from('org-assets')
        .createSignedUrl(storagePath, 3600)

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'upload',
        table_name: 'organization_branding',
        record_id: asset.id,
        new_values: { asset_type: input.assetType, file_name: input.fileName },
      })

      return {
        ...asset,
        signed_url: signedUrl?.signedUrl ?? null,
      }
    }),

  // ============================================
  // DELETE BRANDING ASSET
  // ============================================
  deleteBrandingAsset: orgProtectedProcedure
    .input(z.object({
      assetType: brandingAssetTypeSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Get existing asset
      const { data: existing, error: fetchError } = await supabase
        .from('organization_branding')
        .select('*')
        .eq('org_id', orgId)
        .eq('asset_type', input.assetType)
        .single()

      if (fetchError || !existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Branding asset not found',
        })
      }

      // Delete from storage
      await supabase.storage.from('org-assets').remove([existing.storage_path])

      // Delete record
      const { error: deleteError } = await supabase
        .from('organization_branding')
        .delete()
        .eq('org_id', orgId)
        .eq('asset_type', input.assetType)

      if (deleteError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete branding asset',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete',
        table_name: 'organization_branding',
        record_id: existing.id,
        old_values: { asset_type: input.assetType, file_name: existing.file_name },
      })

      return { success: true }
    }),

  // ============================================
  // GET LOGIN PREVIEW DATA
  // ============================================
  getLoginPreview: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get organization
      const { data: org } = await supabase
        .from('organizations')
        .select('name, logo_url')
        .eq('id', orgId)
        .single()

      // Get branding settings
      const { data: brandingSettings } = await supabase
        .from('organization_settings')
        .select('key, value')
        .eq('org_id', orgId)
        .eq('category', 'branding')

      // Get branding assets
      const { data: assets } = await supabase
        .from('organization_branding')
        .select('asset_type, storage_path')
        .eq('org_id', orgId)

      // Generate signed URLs
      const assetUrls: Record<string, string | null> = {}
      for (const asset of assets ?? []) {
        const { data: signedUrl } = await supabase
          .storage
          .from('org-assets')
          .createSignedUrl(asset.storage_path, 3600)
        assetUrls[asset.asset_type] = signedUrl?.signedUrl ?? null
      }

      // Convert settings to object
      const settings: Record<string, unknown> = {}
      for (const setting of brandingSettings ?? []) {
        try {
          settings[setting.key] = JSON.parse(setting.value as string)
        } catch {
          settings[setting.key] = setting.value
        }
      }

      return {
        organizationName: org?.name ?? '',
        logoUrl: assetUrls.logo_light ?? org?.logo_url ?? null,
        logoDarkUrl: assetUrls.logo_dark ?? null,
        backgroundUrl: assetUrls.login_background ?? null,
        primaryColor: settings.primary_color as string ?? '#000000',
        secondaryColor: settings.secondary_color as string ?? '#B76E79',
        accentColor: settings.accent_color as string ?? '#171717',
        showLogo: settings.login_show_logo as boolean ?? true,
        showCompanyName: settings.login_show_company_name as boolean ?? true,
        welcomeMessage: settings.login_welcome_message as string ?? '',
      }
    }),
})
