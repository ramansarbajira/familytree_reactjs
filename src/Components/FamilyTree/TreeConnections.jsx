import React, { useEffect, useRef, useMemo } from 'react';

const TreeConnections = ({ dagreGraph, dagreLayoutOffsetX, dagreLayoutOffsetY }) => {
    const svgRef = useRef(null);

    // Calculate dynamic canvas size based on tree bounds
    const canvasSize = useMemo(() => {
        if (!dagreGraph) return { width: 15000, height: 10000 };
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        dagreGraph.nodes().forEach(v => {
            const node = dagreGraph.node(v);
            if (node) {
                minX = Math.min(minX, node.x);
                minY = Math.min(minY, node.y);
                maxX = Math.max(maxX, node.x);
                maxY = Math.max(maxY, node.y);
            }
        });
        
        // Add padding and ensure minimum size
        const padding = 200;
        const width = Math.max(15000, (maxX - minX) + padding * 2);
        const height = Math.max(10000, (maxY - minY) + padding * 2);
        
        return { width, height };
    }, [dagreGraph]);

    useEffect(() => {
        if (!dagreGraph || !svgRef.current) return;

        const svg = svgRef.current;
        svg.innerHTML = '';

        // Add arrow marker definition
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '10');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M0,0 L10,3.5 L0,7 Z');
        arrowPath.setAttribute('fill', '#1e293b');
        marker.appendChild(arrowPath);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Member count (used for opacity etc.)
        const memberCount = dagreGraph.nodes().filter(n => !n.startsWith('family-') && !n.startsWith('cluster-') && !n.startsWith('subgraph-')).length;

        // Optimize rendering for large trees
        const isLargeTree = memberCount > 50;
        const connectionOpacity = isLargeTree ? 0.7 : 1; // Reduce opacity for large trees
        const shadowOpacity = isLargeTree ? 0.1 : 0.18; // Reduce shadow for large trees

        // Draw family connectors (parent-child) with optimization
        const familyNodes = dagreGraph.nodes().filter(v => v.startsWith('family-'));
        familyNodes.forEach(v => {
            const familyNode = dagreGraph.node(v);
            if (!familyNode) return;
            
            const parents = (dagreGraph.predecessors(v) || []).map(pid => ({
                id: pid,
                ...dagreGraph.node(pid)
            })).filter(Boolean);
            
            const children = (dagreGraph.successors(v) || []).map(cid => ({
                id: cid,
                ...dagreGraph.node(cid)
            })).filter(Boolean);
            
            if (parents.length === 0 || children.length === 0) return;
            
            // Calculate center points for cleaner connections
            const parentCenterX = parents.reduce((sum, p) => sum + p.x, 0) / parents.length;
            const parentY = parents[0]?.y || 0;
            const childCenterX = children.reduce((sum, c) => sum + c.x, 0) / children.length;
            const childY = children[0]?.y || 0;
            const centerY = parentY + dagreLayoutOffsetY + (childY - parentY) / 2;
            
            // Draw connection from parents to children
            parents.forEach(parent => {
                // Use node's actual height from dagre for precise anchors
                const pHeight = (parent.height || 80);
                const connectOffset = Math.min(14, Math.max(6, pHeight * 0.1));
                const startX = parent.x + dagreLayoutOffsetX;
                const startY = parent.y + dagreLayoutOffsetY + (pHeight / 2) - connectOffset;
                
                // Draw vertical line down from parent
                svg.appendChild(svgPath(
                    `M ${startX} ${startY} L ${startX} ${centerY}`,
                    '#34d399', 5, false, connectionOpacity
                ));
                
                // Draw horizontal line to center
                svg.appendChild(svgPath(
                    `M ${startX} ${centerY} H ${parentCenterX + dagreLayoutOffsetX}`,
                    '#34d399', 5, false, connectionOpacity
                ));
            });
            
            // Connect from the parents' center to each child with an individual T-connector
            children.forEach(child => {
                const cHeight = (child.height || 80);
                const connectOffset = Math.min(14, Math.max(6, cHeight * 0.1));
                const childTopX = child.x + dagreLayoutOffsetX;
                const childTopY = child.y + dagreLayoutOffsetY - (cHeight / 2) + connectOffset;

                // Horizontal from parent center to child's x at centerY, then vertical down to the child's top
                svg.appendChild(svgPath(
                    `M ${parentCenterX + dagreLayoutOffsetX} ${centerY} H ${childTopX} V ${childTopY}`,
                    '#34d399', 5, false, connectionOpacity
                ));

                // Small horizontal nub on child's top edge for a clear T connection
                const nub = 14; // half-length of the small horizontal connector
                svg.appendChild(svgPath(
                    `M ${childTopX - nub} ${childTopY} H ${childTopX + nub}`,
                    '#34d399', 5, false, connectionOpacity
                ));
            });
        });

        // Draw spouse connections with pink lines
        const spousePairs = new Set();
        dagreGraph.edges().forEach(edge => {
            const edgeData = dagreGraph.edge(edge);
            if (edgeData && edgeData.relationship === 'spouse' && !spousePairs.has(edge.w) && !spousePairs.has(edge.v)) {
                const source = dagreGraph.node(edge.v);
                const target = dagreGraph.node(edge.w);
                
                if (source && target) {
                    // Calculate center points
                    const x1 = source.x + dagreLayoutOffsetX;
                    const y1 = source.y + dagreLayoutOffsetY;
                    const x2 = target.x + dagreLayoutOffsetX;
                    const y2 = target.y + dagreLayoutOffsetY;
                    
                    // Draw a curved line between spouses
                    const midX = (x1 + x2) / 2;
                    const curveHeight = 20; // Height of the curve
                    const pathData = `M ${x1} ${y1} Q ${midX} ${y1 + curveHeight}, ${x2} ${y2}`;
                    
                    // Add shadow for depth (pink shadow)
                    svg.appendChild(svgShadowPath(pathData, '#ec4899', 0.3));
                    
                    // Add the main pink line
                    svg.appendChild(svgPath(
                        pathData,
                        '#ec4899', // Pink color
                        3,        // Line width
                        false,    // No arrow
                        0.9       // Slightly transparent
                    ));
                    
                    // Add small circle at the center of the curve
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', midX.toString());
                    circle.setAttribute('cy', (y1 + curveHeight/2).toString());
                    circle.setAttribute('r', '4');
                    circle.setAttribute('fill', '#ec4899');
                    circle.setAttribute('opacity', '0.9');
                    svg.appendChild(circle);
                    
                    // Mark these nodes as processed
                    spousePairs.add(edge.v);
                    spousePairs.add(edge.w);
                }
            }
        });
    }, [dagreGraph, dagreLayoutOffsetX, dagreLayoutOffsetY]);

    // Shadow path for extra contrast
    const svgShadowPath = (d, color = '#10b981', opacity = 0.3) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', 7);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('opacity', opacity.toString());
        path.setAttribute('filter', 'drop-shadow(0px 2px 4px rgba(16, 185, 129, 0.3))');
        return path;
    };

    const svgPath = (d, color, width, arrow, opacity = 1) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', width);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('opacity', opacity.toString());
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        
        // Add subtle shadow for better visibility
        if (width > 2) {
            path.setAttribute('filter', 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))');
        }
        
        if (arrow) {
            path.setAttribute('marker-end', 'url(#arrowhead)');
        }
        return path;
    };

    return (
        <svg
            ref={svgRef}
            className="connections"
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
                position: 'absolute',
                top: '0',
                left: '0',
                zIndex: '1'
            }}
        />
    );
};

export default TreeConnections; 