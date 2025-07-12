import React, { useEffect, useRef } from 'react';

const TreeConnections = ({ dagreGraph, dagreLayoutOffsetX, dagreLayoutOffsetY }) => {
    const svgRef = useRef(null);

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

        const CARD_HEIGHT = 170; // reduced from 220
        const CARD_MARGIN = 12;  // reduced from 24

        // Draw family connectors (parent-child)
        dagreGraph.nodes().forEach(v => {
            if (v.startsWith('family-')) {
                const familyNode = dagreGraph.node(v);
                const parents = dagreGraph.predecessors(v) || [];
                const children = dagreGraph.successors(v) || [];
                if (parents.length > 0 && children.length > 0) {
                    const parentPoints = parents.map(pid => dagreGraph.node(pid));
                    const childPoints = children.map(cid => dagreGraph.node(cid));
                    // Calculate center x between parents
                    const parentXs = parentPoints.map(p => p.x);
                    const centerX = parentXs.length > 1 ? (Math.min(...parentXs) + Math.max(...parentXs)) / 2 : parentXs[0];
                    const connectorY = familyNode.y + dagreLayoutOffsetY;
                    // Draw vertical from each parent to connectorY (bottom edge of parent card)
                    parentPoints.forEach(parent => {
                        if (parent) {
                            const x = parent.x + dagreLayoutOffsetX;
                            const y1 = parent.y + dagreLayoutOffsetY + CARD_HEIGHT / 2; // bottom edge of card (removed CARD_MARGIN)
                            svg.appendChild(svgShadowPath(`M ${x} ${y1} L ${x} ${connectorY}`, '#6ee7b7'));
                            svg.appendChild(svgPath(`M ${x} ${y1} L ${x} ${connectorY}`, '#34d399', 5, false));
                        }
                    });
                    // Draw horizontal connector line at connectorY between parents
                    if (parentPoints.length > 1) {
                        const minX = Math.min(...parentPoints.map(p => p.x)) + dagreLayoutOffsetX;
                        const maxX = Math.max(...parentPoints.map(p => p.x)) + dagreLayoutOffsetX;
                        svg.appendChild(svgShadowPath(`M ${minX} ${connectorY} H ${maxX}`, '#6ee7b7'));
                        svg.appendChild(svgPath(`M ${minX} ${connectorY} H ${maxX}`, '#34d399', 5, false));
                    }
                    // Draw single vertical line from centerX, connectorY to children
                    let childY;
                    if (childPoints.length === 1) {
                        const child = childPoints[0];
                        if (child) {
                            childY = child.y + dagreLayoutOffsetY - CARD_HEIGHT / 2; // top edge of card (removed CARD_MARGIN)
                            svg.appendChild(svgShadowPath(`M ${centerX + dagreLayoutOffsetX} ${connectorY} L ${centerX + dagreLayoutOffsetX} ${childY}`, '#6ee7b7'));
                            svg.appendChild(svgPath(`M ${centerX + dagreLayoutOffsetX} ${connectorY} L ${centerX + dagreLayoutOffsetX} ${childY}`, '#34d399', 5, false));
                            // Connect to child
                            svg.appendChild(svgShadowPath(`M ${centerX + dagreLayoutOffsetX} ${childY} L ${child.x + dagreLayoutOffsetX} ${childY}`, '#6ee7b7'));
                            svg.appendChild(svgPath(`M ${centerX + dagreLayoutOffsetX} ${childY} L ${child.x + dagreLayoutOffsetX} ${childY}`, '#34d399', 5, false));
                        }
                    } else if (childPoints.length > 1) {
                        // 1. Vertical from centerX to junctionY
                        const junctionY = Math.min(...childPoints.map(c => c.y)) + dagreLayoutOffsetY - CARD_HEIGHT / 2 - 10; // less gap
                        svg.appendChild(svgShadowPath(`M ${centerX + dagreLayoutOffsetX} ${connectorY} L ${centerX + dagreLayoutOffsetX} ${junctionY}`, '#6ee7b7'));
                        svg.appendChild(svgPath(`M ${centerX + dagreLayoutOffsetX} ${connectorY} L ${centerX + dagreLayoutOffsetX} ${junctionY}`, '#34d399', 5, false));
                        // 2. Horizontal from leftmost to rightmost child at junctionY
                        const minX = Math.min(...childPoints.map(c => c.x)) + dagreLayoutOffsetX;
                        const maxX = Math.max(...childPoints.map(c => c.x)) + dagreLayoutOffsetX;
                        svg.appendChild(svgShadowPath(`M ${minX} ${junctionY} H ${maxX}`, '#6ee7b7'));
                        svg.appendChild(svgPath(`M ${minX} ${junctionY} H ${maxX}`, '#34d399', 5, false));
                        // 3. Short vertical from horizontal to each child top
                        childPoints.forEach(child => {
                            const childX = child.x + dagreLayoutOffsetX;
                            const childY2 = child.y + dagreLayoutOffsetY - CARD_HEIGHT / 2; // top edge of card (removed CARD_MARGIN)
                            svg.appendChild(svgShadowPath(`M ${childX} ${junctionY} L ${childX} ${childY2}`, '#6ee7b7'));
                            svg.appendChild(svgPath(`M ${childX} ${junctionY} L ${childX} ${childY2}`, '#34d399', 5, false));
                        });
                    }
                }
            }
        });

        // Draw spouse lines (horizontal, no arrow)
        dagreGraph.children().forEach(clusterId => {
            if (clusterId.startsWith('cluster-')) {
                const members = dagreGraph.children(clusterId);
                if (members.length === 2) {
                    const p1 = dagreGraph.node(members[0]);
                    const p2 = dagreGraph.node(members[1]);
                    if (p1 && p2) {
                        const d = `M ${p1.x + dagreLayoutOffsetX},${p1.y + dagreLayoutOffsetY} H ${p2.x + dagreLayoutOffsetX}`;
                        svg.appendChild(svgShadowPath(d, '#bbf7d0'));
                        svg.appendChild(svgPath(d, '#6ee7b7', 5, false));
                    }
                }
            }
        });
    }, [dagreGraph, dagreLayoutOffsetX, dagreLayoutOffsetY]);

    // Shadow path for extra contrast
    const svgShadowPath = (d, color = '#6ee7b7') => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color); // green shadow
        path.setAttribute('stroke-width', 7);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('opacity', '0.18');
        path.setAttribute('filter', 'drop-shadow(0px 2px 6px #bbf7d0)');
        return path;
    };

    const svgPath = (d, color, width, arrow) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', 2);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        if (arrow) {
            path.setAttribute('marker-end', 'url(#arrowhead)');
        }
        return path;
    };

    return (
        <svg
            ref={svgRef}
            className="connections"
            width="15000"
            height="10000"
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