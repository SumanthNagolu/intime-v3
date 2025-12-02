/**
 * EntityGraphView Component
 *
 * Visualizes entity relationships using React Flow.
 * Shows connections between leads, accounts, deals, jobs, talent, and submissions.
 *
 * Features:
 * - Force-directed layout
 * - Zoom/pan controls
 * - Clickable nodes for navigation
 * - Expandable from mini to full-screen
 * - Color-coded by entity type
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Panel,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRouter } from 'next/navigation';
import {
  Target,
  Building2,
  DollarSign,
  Briefcase,
  User,
  Send,
  Users,
  Maximize2,
  Minimize2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { entityRegistry, type EntityType } from '@/lib/workspace';

// =====================================================
// TYPES
// =====================================================

export interface GraphEntity {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  status?: string;
}

export interface GraphRelationship {
  source: string;
  target: string;
  label?: string;
  type?: 'parent' | 'child' | 'related';
}

export interface EntityGraphViewProps {
  centerEntity: GraphEntity;
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  onNodeClick?: (entity: GraphEntity) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_COLORS = { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700' };

const ENTITY_COLORS: Partial<Record<EntityType, { bg: string; border: string; text: string }>> = {
  lead: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  account: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  deal: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  job: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  talent: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700' },
  submission: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  contact: { bg: 'bg-stone-50', border: 'border-stone-300', text: 'text-stone-700' },
  job_order: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },
};

const ENTITY_ICONS: Partial<Record<EntityType, LucideIcon>> = {
  lead: Target,
  account: Building2,
  deal: DollarSign,
  job: Briefcase,
  talent: User,
  submission: Send,
  contact: Users,
  job_order: Briefcase,
};

// =====================================================
// CUSTOM NODE COMPONENT
// =====================================================

interface EntityNodeData {
  entity: GraphEntity;
  isCenter: boolean;
  onClick?: (entity: GraphEntity) => void;
}

function EntityNode({ data }: { data: EntityNodeData }) {
  const { entity, isCenter, onClick } = data;
  const colors = ENTITY_COLORS[entity.type] ?? DEFAULT_COLORS;
  const Icon = ENTITY_ICONS[entity.type] ?? Briefcase;

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-sm cursor-pointer transition-all',
        'hover:shadow-md hover:scale-105',
        colors.bg,
        colors.border,
        isCenter && 'ring-2 ring-rust ring-offset-2'
      )}
      onClick={() => onClick?.(entity)}
    >
      <div className="flex items-center gap-2">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-4 h-4', colors.text)} />
        </div>
        <div className="min-w-0">
          <div className={cn('font-medium text-sm truncate max-w-[150px]', colors.text)}>
            {entity.title}
          </div>
          {entity.subtitle && (
            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
              {entity.subtitle}
            </div>
          )}
        </div>
      </div>
      {entity.status && (
        <Badge
          variant="secondary"
          className={cn('mt-2 text-xs', colors.bg, colors.text)}
        >
          {entity.status}
        </Badge>
      )}
    </div>
  );
}

const nodeTypes = {
  entity: EntityNode,
};

// =====================================================
// LAYOUT HELPERS
// =====================================================

function calculateLayout(
  centerEntity: GraphEntity,
  entities: GraphEntity[],
  relationships: GraphRelationship[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const processedIds = new Set<string>();

  // Add center node
  nodes.push({
    id: centerEntity.id,
    type: 'entity',
    position: { x: 0, y: 0 },
    data: { entity: centerEntity, isCenter: true },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });
  processedIds.add(centerEntity.id);

  // Group entities by type for layout
  const entityGroups: Record<string, GraphEntity[]> = {};
  entities.forEach((entity) => {
    if (entity.id !== centerEntity.id) {
      if (!entityGroups[entity.type]) {
        entityGroups[entity.type] = [];
      }
      entityGroups[entity.type].push(entity);
    }
  });

  // Layout entities in a radial pattern around center
  const groupTypes = Object.keys(entityGroups);
  const angleStep = (2 * Math.PI) / Math.max(groupTypes.length, 1);
  const baseRadius = 250;

  groupTypes.forEach((type, groupIndex) => {
    const group = entityGroups[type];
    const angle = angleStep * groupIndex - Math.PI / 2; // Start from top
    const groupRadius = baseRadius + (group.length > 3 ? 50 : 0);

    group.forEach((entity, entityIndex) => {
      // Spread entities within the group
      const entityAngleOffset = ((entityIndex - (group.length - 1) / 2) * 0.3);
      const entityAngle = angle + entityAngleOffset;
      const entityRadius = groupRadius + (entityIndex % 2) * 80;

      const x = Math.cos(entityAngle) * entityRadius;
      const y = Math.sin(entityAngle) * entityRadius;

      nodes.push({
        id: entity.id,
        type: 'entity',
        position: { x, y },
        data: { entity, isCenter: false },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
      processedIds.add(entity.id);
    });
  });

  // Create edges from relationships
  relationships.forEach((rel, index) => {
    if (processedIds.has(rel.source) && processedIds.has(rel.target)) {
      edges.push({
        id: `e-${rel.source}-${rel.target}-${index}`,
        source: rel.source,
        target: rel.target,
        label: rel.label,
        type: 'smoothstep',
        animated: rel.type === 'parent',
        style: {
          stroke: rel.type === 'parent' ? '#d97706' : '#94a3b8',
          strokeWidth: rel.type === 'parent' ? 2 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: rel.type === 'parent' ? '#d97706' : '#94a3b8',
        },
      });
    }
  });

  return { nodes, edges };
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function EntityGraphView({
  centerEntity,
  entities,
  relationships,
  onNodeClick,
  isExpanded = false,
  onToggleExpand,
  className,
}: EntityGraphViewProps) {
  const router = useRouter();

  // Calculate initial layout
  const initialLayout = useMemo(
    () => calculateLayout(centerEntity, entities, relationships),
    [centerEntity, entities, relationships]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialLayout.nodes);
  const [edges, , onEdgesChange] = useEdgesState(initialLayout.edges);

  // Update nodes with click handler
  useEffect(() => {
    const handleClick = (entity: GraphEntity) => {
      if (onNodeClick) {
        onNodeClick(entity);
      } else {
        // Default navigation
        const config = entityRegistry[entity.type];
        if (config) {
          router.push(config.routes.detail(entity.id));
        }
      }
    };

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, onClick: handleClick },
      }))
    );
  }, [onNodeClick, router, setNodes]);

  // Legend component
  const Legend = () => (
    <div className="flex flex-wrap gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg border border-border">
      {Object.entries(ENTITY_COLORS).map(([type, colors]) => {
        const Icon = ENTITY_ICONS[type as EntityType];
        const config = entityRegistry[type as EntityType];
        if (!Icon || !config) return null;
        return (
          <div key={type} className="flex items-center gap-1 text-xs">
            <div className={cn('w-4 h-4 rounded flex items-center justify-center', colors.bg)}>
              <Icon className={cn('w-3 h-3', colors.text)} />
            </div>
            <span className="text-muted-foreground">{config.name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={cn(
        'relative bg-stone-50 rounded-lg border border-border overflow-hidden',
        isExpanded ? 'fixed inset-4 z-50' : 'h-[400px]',
        className
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        {isExpanded && <MiniMap nodeStrokeWidth={3} />}

        {/* Custom Panel */}
        <Panel position="top-right" className="flex gap-2">
          {onToggleExpand && (
            <Button variant="outline" size="icon" onClick={onToggleExpand}>
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          )}
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left">
          <Legend />
        </Panel>
      </ReactFlow>

      {/* Expanded overlay backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={onToggleExpand}
        />
      )}
    </div>
  );
}

// =====================================================
// SIMPLE MINI GRAPH
// =====================================================

export interface MiniGraphProps {
  centerEntity: GraphEntity;
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  onExpand?: () => void;
  className?: string;
}

export function MiniGraph({
  centerEntity,
  entities,
  relationships,
  onExpand,
  className,
}: MiniGraphProps) {
  return (
    <div className={cn('relative h-48 bg-stone-50 rounded-lg border border-border', className)}>
      <EntityGraphView
        centerEntity={centerEntity}
        entities={entities.slice(0, 6)} // Limit for mini view
        relationships={relationships}
        className="h-full"
      />

      {/* Expand button overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10 rounded-lg">
        <Button variant="secondary" size="sm" onClick={onExpand}>
          <Maximize2 className="w-4 h-4 mr-2" />
          Expand Graph
        </Button>
      </div>

      {/* Entity count badge */}
      <Badge
        variant="secondary"
        className="absolute top-2 right-2 text-xs"
      >
        {entities.length} entities
      </Badge>
    </div>
  );
}

export default EntityGraphView;
