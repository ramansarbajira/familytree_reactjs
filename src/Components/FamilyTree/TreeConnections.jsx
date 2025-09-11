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
            
            // Draw connection from parents to children
            parents.forEach(parent => {
                // Line from parent to center point
                const startX = parent.x + dagreLayoutOffsetX;
                const startY = parent.y + dagreLayoutOffsetY + CARD_HEIGHT / 2 - CARD_CONNECT_OFFSET;
                const centerY = parentY + dagreLayoutOffsetY + (childY - parentY) / 2;
                
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
            
            // Draw center vertical line
            const centerY = parentY + dagreLayoutOffsetY + (childY - parentY) / 2;
            svg.appendChild(svgPath(
                `M ${parentCenterX + dagreLayoutOffsetX} ${centerY} V ${childY + dagreLayoutOffsetY - CARD_HEIGHT / 2 + CARD_CONNECT_OFFSET}`,
                '#34d399', 5, false, connectionOpacity
            ));
            
            // Draw connections to children
            children.forEach(child => {
                const endX = child.x + dagreLayoutOffsetX;
                const endY = child.y + dagreLayoutOffsetY - CARD_HEIGHT / 2 + CARD_CONNECT_OFFSET;
                
                // Draw horizontal line from center to child
                svg.appendChild(svgPath(
                    `M ${parentCenterX + dagreLayoutOffsetX} ${endY} H ${endX}`,
                    '#34d399', 5, false, connectionOpacity
                ));
            });
        });

        // Spouse connection lines removed as per user request
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