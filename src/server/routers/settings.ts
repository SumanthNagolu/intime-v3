import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

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
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Use admin client to bypass RLS and check if org exists
      let { data: org, error } = await adminClient
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      // If org doesn't exist, try to create a default one
      if (error || !org) {
        console.log(`Organization ${orgId} not found, attempting to create...`)
        
        // Create default organization
        const { data: newOrg, error: createError } = await adminClient
          .from('organizations')
          .insert({
            id: orgId,
            name: 'My Organization',
            slug: `org-${orgId.slice(0, 8)}`,
            timezone: 'America/New_York',
            locale: 'en-US',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create organization:', createError)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Organization not found and could not be created',
          })
        }

        org = newOrg
      }

      console.log('[getOrganization] Returning org data:', {
        id: org.id,
        name: org.name,
        industry: org.industry,
        company_size: org.company_size,
      })

      return org
    }),

  // ============================================
  // UPDATE ORGANIZATION
  // ============================================
  updateOrganization: orgProtectedProcedure
    .input(z.object({
      // Existing fields
      name: z.string().min(2).max(200).optional(),
      legal_name: z.string().max(200).optional().nullable(),
      industry: z.string().max(100).optional().nullable(),
      company_size: z.string().max(50).optional().nullable(),
      website: z.string().url().optional().nullable().or(z.literal('')),
      email: z.string().email().optional().nullable().or(z.literal('')),
      phone: z.string().max(50).optional().nullable(),
      timezone: z.string().max(100).optional(),
      locale: z.string().max(20).optional(),

      // NEW: Company Info fields
      founded_year: z.number().min(1800).max(2100).optional().nullable(),

      // NEW: Branding fields
      logo_url: z.string().url().optional().nullable().or(z.literal('')),
      favicon_url: z.string().url().optional().nullable().or(z.literal('')),
      primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
      secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
      background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
      text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),

      // NEW: Regional fields
      date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMM DD, YYYY', 'DD MMM YYYY']).optional(),
      time_format: z.enum(['12h', '24h']).optional(),
      week_start: z.enum(['sunday', 'monday']).optional(),
      currency: z.string().length(3).optional(),
      number_format: z.string().optional(),

      // NEW: Fiscal fields
      fiscal_year_start: z.number().min(1).max(12).optional(),
      reporting_period: z.enum(['monthly', 'quarterly', 'semi-annual']).optional(),
      sprint_alignment: z.boolean().optional(),

      // NEW: Business Hours fields
      business_hours: z.record(z.object({
        open: z.boolean(),
        start: z.string().optional(),
        end: z.string().optional(),
        break_minutes: z.number().optional(),
      })).optional(),
      holiday_calendar: z.enum(['us_federal', 'us_federal_common', 'custom']).optional(),
      custom_holidays: z.array(z.object({
        date: z.string(),
        name: z.string(),
      })).optional(),

      // NEW: Default Values
      default_values: z.object({
        job_status: z.string().optional(),
        job_type: z.string().optional(),
        work_location: z.string().optional(),
        candidate_source: z.string().optional(),
        candidate_availability: z.string().optional(),
        auto_parse_resume: z.boolean().optional(),
        submission_status: z.string().optional(),
        auto_send_client_email: z.boolean().optional(),
        follow_up_days: z.number().optional(),
        auto_create_followup: z.boolean().optional(),
        email_signature_location: z.string().optional(),
        include_company_disclaimer: z.boolean().optional(),
      }).optional(),

      // NEW: Contact Info
      contact_info: z.object({
        main_phone: z.string().optional().nullable(),
        fax: z.string().optional().nullable(),
        general_email: z.string().email().optional().nullable().or(z.literal('')),
        support_email: z.string().email().optional().nullable().or(z.literal('')),
        hr_email: z.string().email().optional().nullable().or(z.literal('')),
        billing_email: z.string().email().optional().nullable().or(z.literal('')),
        linkedin_url: z.string().url().optional().nullable().or(z.literal('')),
        twitter_handle: z.string().optional().nullable(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get current org using admin client (bypass RLS)
      const { data: currentOrg, error: fetchError } = await adminClient
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (fetchError || !currentOrg) {
        console.error('updateOrganization fetch error:', fetchError)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Organization not found: ${fetchError?.message || 'No data'}`,
        })
      }

      // Build update object (only include defined values)
      const urlFields = ['website', 'logo_url', 'favicon_url', 'linkedin_url', 'email']
      const updates: Record<string, unknown> = {}
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          // Handle empty string for URL fields
          if (urlFields.includes(key) && value === '') {
            updates[key] = null
          } else if (key === 'contact_info' && typeof value === 'object' && value !== null) {
            // Handle empty URLs in contact_info
            const contactInfo = { ...value } as Record<string, unknown>
            if (contactInfo.linkedin_url === '') contactInfo.linkedin_url = null
            if (contactInfo.general_email === '') contactInfo.general_email = null
            if (contactInfo.support_email === '') contactInfo.support_email = null
            if (contactInfo.hr_email === '') contactInfo.hr_email = null
            if (contactInfo.billing_email === '') contactInfo.billing_url = null
            updates[key] = contactInfo
          } else {
            updates[key] = value
          }
        }
      })

      console.log('[updateOrganization] Input received:', { industry: input.industry, company_size: input.company_size })
      console.log('[updateOrganization] Updates to apply:', { industry: updates.industry, company_size: updates.company_size })

      if (Object.keys(updates).length === 0) {
        return currentOrg
      }

      // Update organization using admin client (bypass RLS)
      const { data: org, error: updateError } = await adminClient
        .from('organizations')
        .update(updates)
        .eq('id', orgId)
        .select()
        .single()

      if (updateError || !org) {
        console.error('updateOrganization update error:', updateError)
        console.error('updateOrganization updates payload:', updates)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update organization: ${updateError?.message || 'No data returned'}`,
        })
      }

      console.log('[updateOrganization] Saved values:', { industry: org.industry, company_size: org.company_size })

      // Create audit log (non-blocking)
      try {
        await adminClient.from('audit_logs').insert({
          org_id: orgId,
          user_id: user?.id,
          user_email: user?.email,
          action: 'update',
          table_name: 'organizations',
          record_id: orgId,
          old_values: currentOrg,
          new_values: org,
        })
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError)
        // Don't fail the operation if audit logging fails
      }

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
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: assets, error } = await adminClient
        .from('organization_branding')
        .select('*')
        .eq('org_id', orgId)

      if (error) {
        console.error('[getBranding] Error fetching assets:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch branding assets',
        })
      }

      // Generate signed URLs for each asset
      const assetsWithUrls = await Promise.all(
        (assets ?? []).map(async (asset) => {
          const { data: signedUrl } = await adminClient
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
      const { orgId, user, profileId } = ctx
      const adminClient = getAdminClient()

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

      console.log('[uploadBrandingAsset] Uploading:', { assetType: input.assetType, storagePath, mimeType: input.mimeType, size: fileBuffer.length, profileId })

      // Delete existing asset if exists
      const { data: existing } = await adminClient
        .from('organization_branding')
        .select('storage_path')
        .eq('org_id', orgId)
        .eq('asset_type', input.assetType)
        .single()

      if (existing) {
        console.log('[uploadBrandingAsset] Removing existing file:', existing.storage_path)
        await adminClient.storage.from('org-assets').remove([existing.storage_path])
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await adminClient
        .storage
        .from('org-assets')
        .upload(storagePath, fileBuffer, {
          contentType: input.mimeType,
          upsert: true,
        })

      if (uploadError) {
        console.error('[uploadBrandingAsset] Storage upload error:', uploadError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to upload file: ${uploadError.message}`,
        })
      }

      console.log('[uploadBrandingAsset] File uploaded successfully')

      // Upsert branding record - use profileId (user_profiles.id) for uploaded_by foreign key
      const { data: asset, error: dbError } = await adminClient
        .from('organization_branding')
        .upsert({
          org_id: orgId,
          asset_type: input.assetType,
          storage_path: storagePath,
          file_name: input.fileName,
          file_size: fileBuffer.length,
          mime_type: input.mimeType,
          uploaded_by: profileId, // Use profileId, not user.id - FK references user_profiles
        }, {
          onConflict: 'org_id,asset_type',
        })
        .select()
        .single()

      if (dbError || !asset) {
        console.error('[uploadBrandingAsset] Database error:', dbError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to save branding asset record: ${dbError?.message || 'No data returned'}`,
        })
      }

      console.log('[uploadBrandingAsset] Database record created:', asset.id)

      // Get signed URL
      const { data: signedUrl } = await adminClient
        .storage
        .from('org-assets')
        .createSignedUrl(storagePath, 3600)

      // Create audit log (non-blocking)
      try {
        await adminClient.from('audit_logs').insert({
          org_id: orgId,
          user_id: profileId, // Use profileId for consistency
          user_email: user?.email,
          action: 'upload',
          table_name: 'organization_branding',
          record_id: asset.id,
          new_values: { asset_type: input.assetType, file_name: input.fileName },
        })
      } catch (auditError) {
        console.error('[uploadBrandingAsset] Audit log error:', auditError)
        // Don't fail the operation if audit logging fails
      }

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
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get existing asset
      const { data: existing, error: fetchError } = await adminClient
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
      console.log('[deleteBrandingAsset] Removing file:', existing.storage_path)
      await adminClient.storage.from('org-assets').remove([existing.storage_path])

      // Delete record
      const { error: deleteError } = await adminClient
        .from('organization_branding')
        .delete()
        .eq('org_id', orgId)
        .eq('asset_type', input.assetType)

      if (deleteError) {
        console.error('[deleteBrandingAsset] Delete error:', deleteError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete branding asset',
        })
      }

      // Create audit log (non-blocking)
      try {
        await adminClient.from('audit_logs').insert({
          org_id: orgId,
          user_id: user?.id,
          user_email: user?.email,
          action: 'delete',
          table_name: 'organization_branding',
          record_id: existing.id,
          old_values: { asset_type: input.assetType, file_name: existing.file_name },
        })
      } catch (auditError) {
        console.error('[deleteBrandingAsset] Audit log error:', auditError)
        // Don't fail the operation if audit logging fails
      }

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

  // ============================================
  // EXPORT ORGANIZATION SETTINGS
  // ============================================
  exportOrgSettings: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      const { data: org, error } = await supabase
        .from('organizations')
        .select(`
          name, legal_name, industry, company_size, founded_year, website,
          primary_color, secondary_color, background_color, text_color,
          timezone, locale, date_format, time_format, week_start, currency, number_format,
          fiscal_year_start, reporting_period, sprint_alignment,
          business_hours, holiday_calendar, custom_holidays,
          default_values, contact_info,
          email, phone, address_line1, address_line2, city, state, postal_code, country
        `)
        .eq('id', orgId)
        .single()

      if (error || !org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      return {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        settings: org,
      }
    }),

  // ============================================
  // IMPORT ORGANIZATION SETTINGS
  // ============================================
  importOrgSettings: orgProtectedProcedure
    .input(z.object({
      settings: z.record(z.unknown()),
      overwriteExisting: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Get current org for audit
      const { data: currentOrg } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      // Filter to only allowed fields
      const allowedFields = [
        'industry', 'company_size', 'founded_year',
        'primary_color', 'secondary_color', 'background_color', 'text_color',
        'timezone', 'locale', 'date_format', 'time_format', 'week_start', 'currency', 'number_format',
        'fiscal_year_start', 'reporting_period', 'sprint_alignment',
        'business_hours', 'holiday_calendar', 'custom_holidays',
        'default_values', 'contact_info',
      ]

      const updates: Record<string, unknown> = {}
      for (const field of allowedFields) {
        if (input.settings[field] !== undefined) {
          updates[field] = input.settings[field]
        }
      }

      const { data: org, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', orgId)
        .select()
        .single()

      if (error || !org) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to import settings',
        })
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'import',
        table_name: 'organizations',
        record_id: orgId,
        old_values: currentOrg,
        new_values: org,
      })

      return org
    }),

  // ============================================
  // RESET ORGANIZATION SETTINGS SECTION
  // ============================================
  resetOrgSettingsSection: orgProtectedProcedure
    .input(z.object({
      section: z.enum(['branding', 'regional', 'fiscal', 'business_hours', 'defaults']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const defaults: Record<string, Record<string, unknown>> = {
        branding: {
          primary_color: '#000000',
          secondary_color: '#B76E79',
          background_color: '#FDFBF7',
          text_color: '#171717',
        },
        regional: {
          timezone: 'America/New_York',
          locale: 'en-US',
          date_format: 'MM/DD/YYYY',
          time_format: '12h',
          week_start: 'sunday',
          currency: 'USD',
          number_format: '1,234.56',
        },
        fiscal: {
          fiscal_year_start: 1,
          reporting_period: 'quarterly',
          sprint_alignment: true,
        },
        business_hours: {
          business_hours: {
            monday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
            tuesday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
            wednesday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
            thursday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
            friday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
            saturday: { open: false },
            sunday: { open: false },
          },
          holiday_calendar: 'us_federal',
          custom_holidays: [],
        },
        defaults: {
          default_values: {
            job_status: 'draft',
            job_type: 'contract',
            work_location: 'hybrid',
            candidate_source: 'direct_application',
            candidate_availability: '2_weeks',
            auto_parse_resume: true,
            submission_status: 'pending_review',
            auto_send_client_email: false,
            follow_up_days: 3,
            auto_create_followup: true,
            email_signature_location: 'below',
            include_company_disclaimer: true,
          },
        },
      }

      const updates = defaults[input.section]
      if (!updates) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid section',
        })
      }

      const { data: currentOrg } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      const { data: org, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reset settings',
        })
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'reset',
        table_name: 'organizations',
        record_id: orgId,
        old_values: currentOrg,
        new_values: org,
      })

      return org
    }),
})
