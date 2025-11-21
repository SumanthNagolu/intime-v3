'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download, Eye, Filter, Search } from 'lucide-react';

interface Screenshot {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  captured_at: string;
  machine_name: string;
  os_type: string;
  active_window_title: string;
  analyzed: boolean;
  activity_category: string | null;
  confidence: number | null;
  user_profile?: {
    full_name: string;
    email: string;
  };
}

export default function ScreenshotsAuditPage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date(),
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  const supabase = createClient();

  useEffect(() => {
    fetchScreenshots();
  }, [dateRange, categoryFilter, userFilter]);

  async function fetchScreenshots() {
    setLoading(true);

    try {
      let query = supabase
        .from('employee_screenshots')
        .select(
          `
          *,
          user_profile:user_profiles(full_name, email)
        `
        )
        .gte('captured_at', dateRange.from.toISOString())
        .lte('captured_at', dateRange.to.toISOString())
        .is('deleted_at', null)
        .order('captured_at', { ascending: false })
        .limit(100);

      if (categoryFilter !== 'all') {
        query = query.eq('activity_category', categoryFilter);
      }

      if (userFilter !== 'all') {
        query = query.eq('user_id', userFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching screenshots:', error);
        return;
      }

      setScreenshots(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function viewScreenshot(screenshot: Screenshot) {
    setSelectedScreenshot(screenshot);

    // Get signed URL from Supabase Storage
    const { data, error } = await supabase.storage
      .from('employee-screenshots')
      .createSignedUrl(screenshot.filename, 60); // 60 seconds

    if (error) {
      console.error('Error getting signed URL:', error);
      return;
    }

    setImageUrl(data.signedUrl);
  }

  function closeViewer() {
    setSelectedScreenshot(null);
    setImageUrl(null);
  }

  const filteredScreenshots = screenshots.filter((screenshot) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      screenshot.user_profile?.full_name?.toLowerCase().includes(searchLower) ||
      screenshot.user_profile?.email?.toLowerCase().includes(searchLower) ||
      screenshot.machine_name?.toLowerCase().includes(searchLower) ||
      screenshot.activity_category?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Screenshot Audit</h1>
          <p className="text-muted-foreground">
            Employee productivity screenshots for compliance and analysis
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter screenshots by date, employee, or activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, machine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* Activity Category */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button onClick={fetchScreenshots} variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Screenshots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredScreenshots.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredScreenshots.filter((s) => s.analyzed).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (filteredScreenshots.filter((s) => s.analyzed).length /
                  filteredScreenshots.length) *
                  100
              )}
              % complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                filteredScreenshots.reduce((sum, s) => sum + s.file_size, 0) /
                1024 /
                1024
              ).toFixed(1)}{' '}
              MB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unique Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredScreenshots.map((s) => s.user_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screenshots Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Screenshots ({filteredScreenshots.length})</CardTitle>
          <CardDescription>Click a screenshot to view full size</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading screenshots...</div>
          ) : filteredScreenshots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No screenshots found for the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredScreenshots.map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => viewScreenshot(screenshot)}
                >
                  <div className="aspect-video bg-muted rounded flex items-center justify-center mb-2">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {screenshot.user_profile?.full_name || 'Unknown'}
                      </span>
                      {screenshot.analyzed && screenshot.activity_category && (
                        <Badge variant="secondary" className="text-xs">
                          {screenshot.activity_category}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {format(new Date(screenshot.captured_at), 'MMM d, h:mm a')}
                    </p>

                    <p className="text-xs text-muted-foreground truncate">
                      {screenshot.machine_name}
                    </p>

                    {screenshot.analyzed && screenshot.confidence && (
                      <p className="text-xs text-muted-foreground">
                        Confidence: {screenshot.confidence.toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screenshot Viewer Dialog */}
      {selectedScreenshot && (
        <Dialog open={!!selectedScreenshot} onOpenChange={closeViewer}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Screenshot Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Screenshot Image */}
              <div className="bg-muted rounded-lg overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Screenshot"
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center">
                    Loading image...
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Employee</h4>
                  <p className="text-sm">{selectedScreenshot.user_profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedScreenshot.user_profile?.email}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Captured</h4>
                  <p className="text-sm">
                    {format(new Date(selectedScreenshot.captured_at), 'PPpp')}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Machine</h4>
                  <p className="text-sm">{selectedScreenshot.machine_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedScreenshot.os_type}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">File Size</h4>
                  <p className="text-sm">{(selectedScreenshot.file_size / 1024).toFixed(1)} KB</p>
                </div>

                {selectedScreenshot.analyzed && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Activity</h4>
                      <Badge>{selectedScreenshot.activity_category}</Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">AI Confidence</h4>
                      <p className="text-sm">{selectedScreenshot.confidence?.toFixed(1)}%</p>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeViewer}>
                  Close
                </Button>
                {imageUrl && (
                  <Button asChild>
                    <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
