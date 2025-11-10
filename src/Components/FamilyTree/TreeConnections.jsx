import React, { useEffect, useRef, useMemo } from 'react';
import { linkVertical, linkHorizontal } from 'd3-shape';

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

        // Add gradient definitions
        const gradientDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Parent-child gradient
        const parentChildGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        parentChildGradient.setAttribute('id', 'parentChildGradient');
        parentChildGradient.setAttribute('x1', '0%');
        parentChildGradient.setAttribute('y1', '0%');
        parentChildGradient.setAttribute('x2', '0%');
        parentChildGradient.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', 'stop-color:#34d399;stop-opacity:1');
        parentChildGradient.appendChild(stop1);

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('style', 'stop-color:#10b981;stop-opacity:1');
        parentChildGradient.appendChild(stop2);

        gradientDefs.appendChild(parentChildGradient);
        svg.appendChild(gradientDefs);

        // Draw family connectors (parent-child) with better curves
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
            const childY = children[0]?.y || 0;
            const centerY = parentY + dagreLayoutOffsetY + (childY - parentY) / 2;

            // Draw curved connections from parents
            parents.forEach(parent => {
                const pHeight = (parent.height || 80);
                const startX = parent.x + dagreLayoutOffsetX;
                const startY = parent.y + dagreLayoutOffsetY + (pHeight / 2);
                const endX = parentCenterX + dagreLayoutOffsetX;
                const endY = centerY;

                // Create smooth bezier curve
                const controlY = startY + (endY - startY) * 0.3;
                const pathData = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;

                // Add shadow path
                const shadowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                shadowPath.setAttribute('d', pathData);
                shadowPath.setAttribute('stroke', '#000');
                shadowPath.setAttribute('stroke-width', '7');
                shadowPath.setAttribute('fill', 'none');
                shadowPath.setAttribute('opacity', '0.1');
                shadowPath.setAttribute('stroke-linecap', 'round');
                shadowPath.setAttribute('filter', 'blur(2px)');
                svg.appendChild(shadowPath);

                // Main path with gradient
                const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                mainPath.setAttribute('d', pathData);
                mainPath.setAttribute('stroke', 'url(#parentChildGradient)');
                mainPath.setAttribute('stroke-width', '4');
                mainPath.setAttribute('fill', 'none');
                mainPath.setAttribute('stroke-linecap', 'round');
                mainPath.setAttribute('opacity', connectionOpacity.toString());
                svg.appendChild(mainPath);
            });

            // Connect to each child with smooth curves
            children.forEach((child, index) => {
                const cHeight = (child.height || 80);
                const childTopX = child.x + dagreLayoutOffsetX;
                const childTopY = child.y + dagreLayoutOffsetY - (cHeight / 2);

                // Create S-curve from center to child
                const startX = parentCenterX + dagreLayoutOffsetX;
                const startY = centerY;
                const endX = childTopX;
                const endY = childTopY;

                // Calculate control points for smooth S-curve
                const midY = (startY + endY) / 2;
                const controlOffset = Math.abs(endX - startX) * 0.3;

                const pathData = `M ${startX} ${startY} 
                                  C ${startX} ${midY}, 
                                    ${endX} ${midY}, 
                                    ${endX} ${endY}`;

                // Add glow effect for active paths
                const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                glowPath.setAttribute('d', pathData);
                glowPath.setAttribute('stroke', '#34d399');
                glowPath.setAttribute('stroke-width', '8');
                glowPath.setAttribute('fill', 'none');
                glowPath.setAttribute('opacity', '0.2');
                glowPath.setAttribute('stroke-linecap', 'round');
                glowPath.setAttribute('filter', 'blur(4px)');
                svg.appendChild(glowPath);

                // Main curved path
                const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                mainPath.setAttribute('d', pathData);
                mainPath.setAttribute('stroke', 'url(#parentChildGradient)');
                mainPath.setAttribute('stroke-width', '3');
                mainPath.setAttribute('fill', 'none');
                mainPath.setAttribute('stroke-linecap', 'round');
                mainPath.setAttribute('stroke-linejoin', 'round');
                mainPath.setAttribute('opacity', connectionOpacity.toString());

                // Add subtle animation
                const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                animate.setAttribute('attributeName', 'stroke-dasharray');
                animate.setAttribute('values', '0 1000;1000 0');
                animate.setAttribute('dur', '2s');
                animate.setAttribute('begin', `${index * 0.1}s`);
                animate.setAttribute('fill', 'freeze');
                mainPath.appendChild(animate);

                svg.appendChild(mainPath);

                // Add connection dot at child
                const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                dot.setAttribute('cx', endX.toString());
                dot.setAttribute('cy', endY.toString());
                dot.setAttribute('r', '4');
                dot.setAttribute('fill', '#10b981');
                dot.setAttribute('stroke', '#fff');
                dot.setAttribute('stroke-width', '2');
                svg.appendChild(dot);
            });
        });

        // Add spouse gradient
        const spouseGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        spouseGradient.setAttribute('id', 'spouseGradient');
        spouseGradient.setAttribute('x1', '0%');
        spouseGradient.setAttribute('y1', '0%');
        spouseGradient.setAttribute('x2', '100%');
        spouseGradient.setAttribute('y2', '0%');

        const spouseStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        spouseStop1.setAttribute('offset', '0%');
        spouseStop1.setAttribute('style', 'stop-color:#ec4899;stop-opacity:1');
        spouseGradient.appendChild(spouseStop1);

        const spouseStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        spouseStop2.setAttribute('offset', '50%');
        spouseStop2.setAttribute('style', 'stop-color:#db2777;stop-opacity:1');
        spouseGradient.appendChild(spouseStop2);

        const spouseStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        spouseStop3.setAttribute('offset', '100%');
        spouseStop3.setAttribute('style', 'stop-color:#ec4899;stop-opacity:1');
        spouseGradient.appendChild(spouseStop3);

        gradientDefs.appendChild(spouseGradient);

        // Draw spouse connections with beautiful curves
        const spousePairs = new Set();
        dagreGraph.edges().forEach(edge => {
            const edgeData = dagreGraph.edge(edge);
            if (edgeData && edgeData.relationship === 'spouse' && !spousePairs.has(edge.w) && !spousePairs.has(edge.v)) {
                const source = dagreGraph.node(edge.v);
                const target = dagreGraph.node(edge.w);

                if (source && target) {
                    const x1 = source.x + dagreLayoutOffsetX;
                    const y1 = source.y + dagreLayoutOffsetY;
                    const x2 = target.x + dagreLayoutOffsetX;
                    const y2 = target.y + dagreLayoutOffsetY;
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;

                    // Create a subtle curve
                    const curveOffset = 15;
                    const pathData = `M ${x1} ${y1} Q ${midX} ${y1 - curveOffset}, ${x2} ${y2}`;

                    // Outer glow
                    const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    glowPath.setAttribute('d', pathData);
                    glowPath.setAttribute('stroke', '#ec4899');
                    glowPath.setAttribute('stroke-width', '12');
                    glowPath.setAttribute('fill', 'none');
                    glowPath.setAttribute('opacity', '0.15');
                    glowPath.setAttribute('stroke-linecap', 'round');
                    glowPath.setAttribute('filter', 'blur(6px)');
                    svg.appendChild(glowPath);

                    // Main spouse connection with gradient
                    const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    mainPath.setAttribute('d', pathData);
                    mainPath.setAttribute('stroke', 'url(#spouseGradient)');
                    mainPath.setAttribute('stroke-width', '3');
                    mainPath.setAttribute('fill', 'none');
                    mainPath.setAttribute('stroke-linecap', 'round');
                    mainPath.setAttribute('opacity', '0.85');
                    mainPath.setAttribute('stroke-dasharray', '8,4');
                    svg.appendChild(mainPath);

                    // Animated heart in the middle
                    const heartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    heartGroup.setAttribute('transform', `translate(${midX}, ${midY - curveOffset / 2})`);

                    // Heart background circle
                    const heartBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    heartBg.setAttribute('cx', '0');
                    heartBg.setAttribute('cy', '0');
                    heartBg.setAttribute('r', '12');
                    heartBg.setAttribute('fill', '#fff');
                    heartBg.setAttribute('stroke', '#ec4899');
                    heartBg.setAttribute('stroke-width', '2');
                    heartGroup.appendChild(heartBg);

                    // Heart symbol
                    const heart = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    heart.setAttribute('x', '0');
                    heart.setAttribute('y', '5');
                    heart.setAttribute('text-anchor', 'middle');
                    heart.setAttribute('fill', '#ec4899');
                    heart.setAttribute('font-size', '16');
                    heart.setAttribute('font-family', 'sans-serif');
                    heart.textContent = '♥';

                    // Add pulsing animation
                    const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                    animateTransform.setAttribute('attributeName', 'transform');
                    animateTransform.setAttribute('type', 'scale');
                    animateTransform.setAttribute('values', '1;1.2;1');
                    animateTransform.setAttribute('dur', '2s');
                    animateTransform.setAttribute('repeatCount', 'indefinite');
                    animateTransform.setAttribute('additive', 'sum');
                    heartGroup.appendChild(animateTransform);

                    heartGroup.appendChild(heart);
                    svg.appendChild(heartGroup);

                    // Mark as processed
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