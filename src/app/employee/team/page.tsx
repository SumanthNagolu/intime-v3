import Link from 'next/link'
import { getTeamWorkspace } from '@/server/actions/team-workspace'
import { TeamWorkspaceClient } from './TeamWorkspaceClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ArrowLeft } from 'lucide-react'

export default async function TeamWorkspacePage() {
  const data = await getTeamWorkspace()

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6 bg-cream">
        <Card className="max-w-md w-full bg-white shadow-elevation-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-charcoal-500" />
            </div>
            <h2 className="text-xl font-heading font-semibold text-charcoal-900 mb-2">
              No Team Assigned
            </h2>
            <p className="text-charcoal-600 mb-6">
              You are not currently assigned to any team or pod. Contact your administrator to be added to a team.
            </p>
            <Button asChild variant="outline">
              <Link href="/employee/workspace">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Workspace
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <TeamWorkspaceClient data={data} />
}
