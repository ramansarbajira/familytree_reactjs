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

        // Dynamic card height based on member count
        const memberCount = dagreGraph.nodes().filter(n => !n.startsWith('family-') && !n.startsWith('cluster-') && !n.startsWith('subgraph-')).length;
        const getCardHeight = () => {
            if (memberCount > 100) return 120; // Very compact for large trees
            if (memberCount > 50) return 140;  // Compact for medium trees
            return window.innerWidth <= 600 ? 140 : 220; // Normal size
        };
        
        const CARD_HEIGHT = getCardHeight();
        const CARD_CONNECT_OFFSET = memberCount > 50 ? 8 : 10; // Smaller offset for large trees

        // Optimize rendering for large trees
        const isLargeTree = memberCount > 50;
        const connectionOpacity = isLargeTree ? 0.7 : 1; // Reduce opacity for large trees
        const shadowOpacity = isLargeTree ? 0.1 : 0.18; // Reduce shadow for large trees

        // Draw family connectors (parent-child) with optimization
        const familyNodes = dagreGraph.nodes().filter(v => v.startsWith('family-'));
        familyNodes.forEach(v => {
            const familyNode = dagreGraph.node(v);
            const parents = dagreGraph.predecessors(v) || [];
            const children = dagreGraph.successors(v) || [];
            
            if (parents.length > 0 && children.length > 0) {
                // Get parent and child node positions
                const parentPoints = parents.map(pid => dagreGraph.node(pid)).filter(Boolean);
                const childPoints = children.map(cid => dagreGraph.node(cid)).filter(Boolean);
                
                if (parentPoints.length === 0 || childPoints.length === 0) return;
                
                // Draw vertical line from each parent to y of family node
                parentPoints.forEach(parent => {
                    const x = parent.x + dagreLayoutOffsetX;
                    const y1 = parent.y + dagreLayoutOffsetY + CARD_HEIGHT / 2 - CARD_CONNECT_OFFSET;
                    const y2 = familyNode.y + dagreLayoutOffsetY;
                    svg.appendChild(svgShadowPath(`M ${x} ${y1} L ${x} ${y2}`, '#6ee7b7', shadowOpacity));
                    svg.appendChild(svgPath(`M ${x} ${y1} L ${x} ${y2}`, '#34d399', 5, false, connectionOpacity));
                });
                
                // Draw horizontal connector line at y of family node
                if (parentPoints.length > 1) {
                    const minX = Math.min(...parentPoints.map(p => p.x)) + dagreLayoutOffsetX;
                    const maxX = Math.max(...parentPoints.map(p => p.x)) + dagreLayoutOffsetX;
                    const y = familyNode.y + dagreLayoutOffsetY;
                    svg.appendChild(svgShadowPath(`M ${minX} ${y} H ${maxX}`, '#6ee7b7', shadowOpacity));
                    svg.appendChild(svgPath(`M ${minX} ${y} H ${maxX}`, '#34d399', 5, false, connectionOpacity));
                }
                
                // Children connector logic
                const connectorX = familyNode.x + dagreLayoutOffsetX;
                const connectorY = familyNode.y + dagreLayoutOffsetY;
                
                if (childPoints.length === 1) {
                    // Single child: straight vertical line
                    const child = childPoints[0];
                    const childX = child.x + dagreLayoutOffsetX;
                    const childY = child.y + dagreLayoutOffsetY - CARD_HEIGHT / 2 + CARD_CONNECT_OFFSET;
                    svg.appendChild(svgShadowPath(`M ${connectorX} ${connectorY} L ${childX} ${childY}`, '#6ee7b7', shadowOpacity));
                    svg.appendChild(svgPath(`M ${connectorX} ${connectorY} L ${childX} ${childY}`, '#34d399', 5, false, connectionOpacity));
                } else if (childPoints.length > 1) {
                    // Multiple children: optimized connector
                    const childY = Math.min(...childPoints.map(c => c.y)) + dagreLayoutOffsetY - CARD_HEIGHT / 2 - 20 + CARD_CONNECT_OFFSET;
                    
                    // Vertical line from connector to horizontal connector
                    svg.appendChild(svgShadowPath(`M ${connectorX} ${connectorY} L ${connectorX} ${childY}`, '#6ee7b7', shadowOpacity));
                    svg.appendChild(svgPath(`M ${connectorX} ${connectorY} L ${connectorX} ${childY}`, '#34d399', 5, false, connectionOpacity));
                    
                    // Horizontal line connecting all children
                    const minX = Math.min(...childPoints.map(c => c.x)) + dagreLayoutOffsetX;
                    const maxX = Math.max(...childPoints.map(c => c.x)) + dagreLayoutOffsetX;
                    svg.appendChild(svgShadowPath(`M ${minX} ${childY} H ${maxX}`, '#6ee7b7', shadowOpacity));
                    svg.appendChild(svgPath(`M ${minX} ${childY} H ${maxX}`, '#34d399', 5, false, connectionOpacity));
                    
                    // Short vertical line from horizontal to each child
                    childPoints.forEach(child => {
                        const childX = child.x + dagreLayoutOffsetX;
                        const childY2 = child.y + dagreLayoutOffsetY - CARD_HEIGHT / 2 + CARD_CONNECT_OFFSET;
                        svg.appendChild(svgShadowPath(`M ${childX} ${childY} L ${childX} ${childY2}`, '#6ee7b7', shadowOpacity));
                        svg.appendChild(svgPath(`M ${childX} ${childY} L ${childX} ${childY2}`, '#34d399', 5, false, connectionOpacity));
                    });
                }
            }
        });

        // Draw spouse lines with optimization
        const clusters = dagreGraph.children().filter(clusterId => clusterId.startsWith('cluster-'));
        clusters.forEach(clusterId => {
            const members = dagreGraph.children(clusterId);
            if (members.length === 2) {
                const p1 = dagreGraph.node(members[0]);
                const p2 = dagreGraph.node(members[1]);
                if (p1 && p2) {
                    const d = `M ${p1.x + dagreLayoutOffsetX},${p1.y + dagreLayoutOffsetY} H ${p2.x + dagreLayoutOffsetX}`;
                    svg.appendChild(svgShadowPath(d, '#bbf7d0', shadowOpacity));
                    svg.appendChild(svgPath(d, '#6ee7b7', 5, false, connectionOpacity));
                }
            }
        });
    }, [dagreGraph, dagreLayoutOffsetX, dagreLayoutOffsetY]);

    // Shadow path for extra contrast
    const svgShadowPath = (d, color = '#6ee7b7', opacity = 0.18) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', 7);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('opacity', opacity.toString());
        path.setAttribute('filter', 'drop-shadow(0px 2px 6px #bbf7d0)');
        return path;
    };

    const svgPath = (d, color, width, arrow, opacity = 1) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', width);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('opacity', opacity.toString());
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