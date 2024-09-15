import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Agent {
  _id: string;
  agent_name: string;
  topic: string;
  avatar: string;
  friends: {
    friend_id: string;
    strength: number;
  }[];
  jobs_in_progress?: number;
  jobs_completed?: number;
  rating?: number;
}

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  description: string;
  avatar: string;
  jobs_in_progress?: number;
  jobs_completed?: number;
  rating?: number;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
  strength: number;
}

const GraphComponent: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const width = window.innerWidth;
  const height = window.innerHeight;

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height/ 2);

    const color = d3
      .scaleLinear<string>()
      .domain([0, 1])
      .range(['#2f7ff7', '#ff008a']);

    const container = svg.append('g');

    d3.json<Agent[]>('/data/agents_data.json')
      .then((data) => {
        if (!data) {
          throw new Error('No data');
        }

        const nodes: NodeDatum[] = data.map((d) => ({
          id: d._id,
          name: d.agent_name,
          description: d.topic,
          avatar: d.avatar,
          jobs_in_progress: d.jobs_in_progress,
          jobs_completed: d.jobs_completed,
          rating: d.rating,
        }));

        let links: LinkDatum[] = [];

        data.forEach((agent) => {
          agent.friends.forEach((friend) => {
            links.push({
              source: agent._id,
              target: friend.friend_id,
              strength: friend.strength,
            });
          });
        });

        // Remove duplicate edges
        const linkSet = new Set<string>();
        const uniqueLinks = links.filter((link) => {
          const key1 = `${link.source}-${link.target}`;
          const key2 = `${link.target}-${link.source}`;
          if (linkSet.has(key1) || linkSet.has(key2)) {
            return false;
          } else {
            linkSet.add(key1);
            return true;
          }
        });

        const nodeDegree: Record<string, number> = {};
        uniqueLinks.forEach((link) => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          nodeDegree[sourceId] = (nodeDegree[sourceId] || 0) + 1;
          nodeDegree[targetId] = (nodeDegree[targetId] || 0) + 1;
        });

        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', '#f9f9f9')
          .style('border', '1px solid #d3d3d3')
          .style('padding', '5px')
          .style('border-radius', '5px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        const hoverCard = d3
          .select('body')
          .append('div')
          .attr('class', 'hover-card')
          .style('position', 'absolute')
          .style('background', 'white')
          .style('border', '1px solid #d3d3d3')
          .style('border-radius', '5px')
          .style('padding', '10px')
          .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        const simulation = d3
          .forceSimulation<NodeDatum>(nodes)
          .force(
            'link',
            d3
              .forceLink<NodeDatum, LinkDatum>(uniqueLinks)
              .id((d) => d.id)
              .strength((d) => d.strength * 0.1)
          )
          .force('charge', d3.forceManyBody().strength(-300))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide<NodeDatum>().radius(15));

        const link = container
          .append('g')
          .attr('class', 'links')
          .selectAll<SVGPathElement, LinkDatum>('path')
          .data(uniqueLinks)
          .enter()
          .append('path')
          .attr('stroke-width', (d) => d.strength * 4)
          .attr('stroke', (d) => color(d.strength))
          .attr('stroke-opacity', (d) => d.strength)
          .attr('fill', 'none')
          .on('mouseover', function (event, d) {
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip
              .html(`Strength: ${d.strength}`)
              .style('left', event.pageX + 5 + 'px')
              .style('top', event.pageY - 28 + 'px');
          })
          .on('mouseout', function () {
            tooltip.transition().duration(500).style('opacity', 0);
          });

        const nodeGroup = container
          .append('g')
          .attr('class', 'nodes')
          .selectAll<SVGGElement, NodeDatum>('g')
          .data(nodes)
          .enter()
          .append('g')
          .call(
            d3
              .drag<SVGGElement, NodeDatum>()
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended)
          )
          .on('mouseover', handleMouseOver)
          .on('mouseout', handleMouseOut)
          .on('click', handleClick);

        const nodeCircles = nodeGroup
          .append('circle')
          .attr('r', (d) => Math.sqrt(nodeDegree[d.id] || 1) * 5)
          .attr('fill', '#2ff79b');

        nodeGroup
          .append('text')
          .attr('class', 'label')
          .text((d) => d.name)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('fill', '#555');

        simulation.nodes(nodes).on('tick', ticked);
        (simulation.force('link') as d3.ForceLink<NodeDatum, LinkDatum>).links(uniqueLinks);

        function ticked() {
          link.attr('d', (d) => {
            const source = d.source as NodeDatum;
            const target = d.target as NodeDatum;
            const dx = target.x! - source.x!;
            const dy = target.y! - source.y!;
            const dr = Math.sqrt(dx * dx + dy * dy);
            return `M${source.x},${source.y} A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
          });

          nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
        }

        function dragstarted(event: any, d: NodeDatum) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(event: any, d: NodeDatum) {
          d.fx = event.x;
          d.fy = event.y;
        }

        function dragended(event: any, d: NodeDatum) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        function handleMouseOver(this: SVGGElement, event: MouseEvent, d: NodeDatum) {
          const group = d3.select<SVGGElement, NodeDatum>(this);
          group
            .select('circle')
            .transition()
            .duration(200)
            .attr('r', Math.sqrt(nodeDegree[d.id] || 1) * 7)
            .attr('fill', '#ff6666');

          hoverCard.transition().duration(200).style('opacity', 1);

          hoverCard
            .html(
              `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <img src="${d.avatar}" alt="${d.name}" style="width: 40px; height: 40px; border-radius: 20px; margin-right: 8px;">
              <h3 style="margin: 0;">${d.name}</h3>
            </div>
            <p>${d.description}</p>
            <p><strong>Friends:</strong> ${nodeDegree[d.id] || 0}</p>
            <p><strong>Jobs in Progress:</strong> ${d.jobs_in_progress || 0}</p>
            <p><strong>Jobs Completed:</strong> ${d.jobs_completed || 0}</p>
            <p><strong>Rating:</strong> ${d.rating || 'N/A'}</p>
          `
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
        }

        function handleMouseOut(this: SVGGElement) {
          const group = d3.select<SVGGElement, NodeDatum>(this);
          group
            .select('circle')
            .transition()
            .duration(200)
            .attr('r', (d) => Math.sqrt(nodeDegree[d.id] || 1) * 5)
            .attr('fill', '#2ff79b');

          hoverCard.transition().duration(500).style('opacity', 0);
        }

        let selectedNode: NodeDatum | null = null;

        function handleClick(this: SVGGElement, event: MouseEvent, d: NodeDatum) {
          if (selectedNode === d) {
            nodeCircles.transition().duration(200).attr('opacity', 1);
            link.transition().duration(200).attr('opacity', 1);
            selectedNode = null;
          } else {
            if (selectedNode) {
              nodeCircles.transition().duration(200).attr('opacity', 1);
              link.transition().duration(200).attr('opacity', 1);
            }
            selectedNode = d;

            nodeCircles
              .transition()
              .duration(200)
              .attr('opacity', (n) => {
                const connected =
                  n === d ||
                  uniqueLinks.some((l) => {
                    const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
                    const targetId = typeof l.target === 'string' ? l.target : l.target.id;
                    return (
                      (sourceId === d.id && targetId === n.id) ||
                      (targetId === d.id && sourceId === n.id)
                    );
                  });
                return connected ? 1 : 0.1;
              });

            link
              .transition()
              .duration(200)
              .attr('opacity', (l) => {
                const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
                const targetId = typeof l.target === 'string' ? l.target : l.target.id;
                return sourceId === d.id || targetId === d.id ? l.strength : 0.1;
              });
          }
        }

        // Add zoom functionality
        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.5, 5])
          .on('zoom', (event) => {
            container.attr('transform', event.transform);
          });

        svg.call(zoom);
      })
      .catch((error) => {
        console.error('Error loading the data:', error);
      });

    return () => {
      // Clean up
      d3.select(svgRef.current).selectAll('*').remove();
      d3.select('body').select('.tooltip').remove();
      d3.select('body').select('.hover-card').remove();
    };
  }, []);
  // The parsing error occurs because this is a TypeScript file (.ts extension)
  // but it contains JSX syntax. To fix this, we need to change the file extension
  // to .tsx and use a non-JSX return statement.

  return React.createElement('div', { id: 'graph' },
    React.createElement('svg', { ref: svgRef })
  );
};

export default GraphComponent;