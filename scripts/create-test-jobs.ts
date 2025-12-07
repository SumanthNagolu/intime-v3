import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createTestJobs() {
  const orgId = '1823fed2-e399-4fae-b9e7-f454d47ba64e'
  const userId = '23853a17-5877-46e2-9756-6c3244ba53e0' // rec1

  // Get active accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .limit(5)

  console.log('Available accounts:', accounts?.map((a) => a.name))

  if (!accounts || accounts.length === 0) {
    console.log('No active accounts found!')
    return
  }

  const jobs = [
    {
      title: 'Senior Software Engineer',
      description:
        'We are looking for a Senior Software Engineer to join our team and help build scalable web applications.',
      location: 'San Francisco, CA',
      job_type: 'contract',
      status: 'open',
      required_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      nice_to_have_skills: ['TypeScript', 'GraphQL', 'AWS'],
      min_experience_years: 5,
      max_experience_years: 10,
      rate_min: 80,
      rate_max: 120,
      rate_type: 'hourly',
      positions_count: 2,
      priority: 'high',
      is_remote: true,
      account_id: accounts[0].id,
    },
    {
      title: 'DevOps Engineer',
      description: 'Join our DevOps team to help automate and scale our cloud infrastructure.',
      location: 'Austin, TX',
      job_type: 'permanent',
      status: 'open',
      required_skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
      nice_to_have_skills: ['Python', 'Go', 'CI/CD'],
      min_experience_years: 3,
      max_experience_years: 8,
      rate_min: 130000,
      rate_max: 180000,
      rate_type: 'annual',
      positions_count: 1,
      priority: 'urgent',
      is_remote: false,
      account_id: accounts[1 % accounts.length].id,
    },
    {
      title: 'Product Manager',
      description: 'Lead product strategy and roadmap for our flagship SaaS platform.',
      location: 'New York, NY',
      job_type: 'permanent',
      status: 'open',
      required_skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
      nice_to_have_skills: ['SQL', 'Figma', 'Technical Background'],
      min_experience_years: 4,
      max_experience_years: 10,
      rate_min: 140000,
      rate_max: 200000,
      rate_type: 'annual',
      positions_count: 1,
      priority: 'normal',
      is_remote: true,
      is_hybrid: true,
      hybrid_days: 2,
      account_id: accounts[2 % accounts.length].id,
    },
    {
      title: 'Data Analyst',
      description: 'Analyze business data to drive strategic decisions and improve operations.',
      location: 'Chicago, IL',
      job_type: 'contract_to_hire',
      status: 'draft',
      required_skills: ['SQL', 'Python', 'Tableau', 'Excel'],
      nice_to_have_skills: ['R', 'Power BI', 'Looker'],
      min_experience_years: 2,
      max_experience_years: 5,
      rate_min: 50,
      rate_max: 75,
      rate_type: 'hourly',
      positions_count: 3,
      priority: 'normal',
      is_remote: false,
      account_id: accounts[3 % accounts.length].id,
    },
    {
      title: 'UX Designer',
      description: 'Design intuitive user experiences for mobile and web applications.',
      location: 'Seattle, WA',
      job_type: 'contract',
      status: 'open',
      required_skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping'],
      nice_to_have_skills: ['CSS', 'HTML', 'Design Systems'],
      min_experience_years: 3,
      max_experience_years: 7,
      rate_min: 65,
      rate_max: 95,
      rate_type: 'hourly',
      positions_count: 1,
      priority: 'high',
      is_remote: true,
      account_id: accounts[4 % accounts.length].id,
    },
  ]

  for (const job of jobs) {
    // Remove is_hybrid since it doesn't exist as a column
    const { is_hybrid, ...jobData } = job as typeof job & { is_hybrid?: boolean }

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        org_id: orgId,
        owner_id: userId,
        posted_date: job.status === 'open' ? new Date().toISOString() : null,
        ...jobData,
      })
      .select('id, title, status')

    if (error) {
      console.error('Error creating job ' + job.title + ':', error.message)
    } else if (data && data[0]) {
      console.log('Created job:', data[0].title, '(' + data[0].status + ')')

      // Create initial status history
      await supabase.from('job_status_history').insert({
        org_id: orgId,
        job_id: data[0].id,
        new_status: job.status,
        changed_by: userId,
        reason: 'Job created',
      })
    }
  }

  console.log('\nDone creating 5 jobs!')
}

createTestJobs().catch(console.error)
