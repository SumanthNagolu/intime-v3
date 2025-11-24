import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createProfile() {
    const userId = 'e2a811de-af30-4991-8f94-f15bfedb4ac7';
    const email = 'test-1763772630902@example.com';
    const fullName = 'Test User';

    console.log(`Creating profile for user ${userId}...`);

    // Check if profile exists
    const { data: existing } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (existing) {
        console.log('Profile already exists:', existing);
        return;
    }

    // Note: user_profiles table usually has id matching auth.users.id
    // And potentially other required fields.
    // I need to know the schema of user_profiles.
    // Assuming standard fields.

    // 1. Get Organization
    let orgId: string;
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();

    if (org) {
        orgId = org.id;
        console.log(`Using existing organization: ${orgId}`);
    } else {
        console.log('Creating new organization...');
        const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: 'Test Organization',
                slug: 'test-org',
                type: 'staffing_agency'
            })
            .select()
            .single();

        if (orgError) {
            console.error('Error creating org:', orgError);
            return;
        }
        orgId = newOrg.id;
        console.log(`Created organization: ${orgId}`);
    }

    // 2. Create User Profile
    console.log('Creating user profile...');
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
            id: userId,
            auth_id: userId, // Important: link to auth user
            email: email,
            full_name: fullName,
            org_id: orgId,
            // No role column here
        })
        .select()
        .single();

    if (profileError) {
        console.error('Error creating profile:', profileError);
        return;
    }
    console.log('Profile created:', profile);

    // 3. Assign Role
    console.log('Assigning student role...');
    const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'student')
        .single();

    if (role) {
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
                user_id: userId,
                role_id: role.id,
                is_primary: true
            });

        if (roleError) {
            console.error('Error assigning role:', roleError);
        } else {
            console.log('Role assigned successfully');
        }
    } else {
        console.error('Student role not found. Run seed-roles.ts first.');
    }
}

createProfile();
