/**
 * Course Form Component
 * Story: ACAD-005
 *
 * Reusable form for creating and editing courses
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Course } from '@/types/academy';

interface CourseFormProps {
  course?: Course;
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    slug: course?.slug || '',
    title: course?.title || '',
    subtitle: course?.subtitle || '',
    description: course?.description || '',
    estimated_duration_weeks: course?.estimated_duration_weeks || 8,
    skill_level: course?.skill_level || 'beginner',
    price_monthly: course?.price_monthly || null,
    price_one_time: course?.price_one_time || null,
    thumbnail_url: course?.thumbnail_url || '',
    promo_video_url: course?.promo_video_url || '',
    is_included_in_all_access: course?.is_included_in_all_access ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would use tRPC
      // For now, direct API call
      const endpoint = course ? `/api/courses/${course.id}` : '/api/courses';
      const method = course ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save course');
      }

      router.push('/admin/courses');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      // Auto-generate slug if creating new course
      slug: !course ? generateSlug(title) : formData.slug,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="title">Course Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Guidewire PolicyCenter Development"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="slug">URL Slug *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="guidewire-policycenter-development"
          pattern="[a-z0-9-]+"
          required
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground mt-1">
          URL-friendly identifier (lowercase, hyphens only)
        </p>
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={formData.subtitle || ''}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="Master insurance software development in 8 weeks"
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Comprehensive course covering..."
          rows={5}
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duration (weeks) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.estimated_duration_weeks}
            onChange={(e) =>
              setFormData({
                ...formData,
                estimated_duration_weeks: parseInt(e.target.value),
              })
            }
            min="1"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="skill_level">Skill Level *</Label>
          <Select
            value={formData.skill_level}
            onValueChange={(value) =>
              setFormData({ ...formData, skill_level: value as any })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price_monthly">Monthly Price ($)</Label>
          <Input
            id="price_monthly"
            type="number"
            step="0.01"
            value={formData.price_monthly || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                price_monthly: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="49.99"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="price_one_time">One-time Price ($)</Label>
          <Input
            id="price_one_time"
            type="number"
            step="0.01"
            value={formData.price_one_time || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                price_one_time: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="499.00"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
        <Input
          id="thumbnail_url"
          type="url"
          value={formData.thumbnail_url || ''}
          onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
          placeholder="https://..."
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="promo_video_url">Promo Video URL</Label>
        <Input
          id="promo_video_url"
          type="url"
          value={formData.promo_video_url || ''}
          onChange={(e) => setFormData({ ...formData, promo_video_url: e.target.value })}
          placeholder="https://..."
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="all_access"
          checked={formData.is_included_in_all_access}
          onCheckedChange={(checked) =>
            setFormData({
              ...formData,
              is_included_in_all_access: checked as boolean,
            })
          }
          disabled={isLoading}
        />
        <Label htmlFor="all_access" className="cursor-pointer">
          Include in All-Access Pass
        </Label>
      </div>

      <div className="flex gap-4 pt-6 border-t">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
