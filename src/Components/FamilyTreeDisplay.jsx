// src/components/FamilyTreeDisplay.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import MemberCard from './MemberCard'; // Import the new MemberCard component

const FamilyTreeDisplay = ({ data, onNodeClick, nodeRefs }) => {
    const containerRef = useRef(null); // Ref for the main display container
    const svgRef = useRef(null); // Ref for the SVG element
    const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

    // Function to get the center coordinates of a node
    const getNodeCenter = useCallback((id) => {
        const nodeElement = nodeRefs.current[id];
        const containerElement = containerRef.current;
        if (nodeElement && containerElement) {
            const nodeRect = nodeElement.getBoundingClientRect();
            const containerRect = containerElement.getBoundingClientRect();
            return {
                x: nodeRect.left + nodeRect.width / 2 - containerRect.left,
                y: nodeRect.top + nodeRect.height / 2 - containerRect.top,
            };
        }
        return { x: 0, y: 0 };
    }, [nodeRefs]);

    // Function to draw lines between nodes
    const drawLines = useCallback(() => {
        const lines = [];
        const drawnConnections = new Set(); // To prevent duplicate lines for shared parents

        // Iterate through all nodes to draw connections
        data.forEach(node => {
            // Draw line to spouse
            if (node.spouseId) {
                const spouseNode = data.find(n => n.id === node.spouseId);
                if (spouseNode) {
                    // Ensure line is drawn only once per couple
                    const connectionKey = [node.id, spouseNode.id].sort().join('-');
                    if (!drawnConnections.has(connectionKey)) {
                        const p1 = getNodeCenter(node.id);
                        const p2 = getNodeCenter(spouseNode.id);
                        if (p1.x && p2.x) {
                            // Draw line between the centers of the bottom of their circles
                            lines.push({
                                type: 'line',
                                x1: p1.x, y1: p1.y + 40,
                                x2: p2.x, y2: p2.y + 40,
                            });
                            drawnConnections.add(connectionKey);
                        }
                    }
                }
            }

            // Draw lines to children
            if (node.childrenIds && node.childrenIds.length > 0) {
                const parentCenter = getNodeCenter(node.id);
                const spouseCenter = node.spouseId ? getNodeCenter(node.spouseId) : null;

                if (parentCenter.x) {
                    // Calculate the midpoint of the parent(s) for the vertical line start
                    const midX = spouseCenter ? (parentCenter.x + spouseCenter.x) / 2 : parentCenter.x;
                    const topY = parentCenter.y + 70; // Point below the circle, above the label

                    // Vertical line down from parent/couple midpoint
                    lines.push({
                        type: 'line',
                        x1: midX, y1: topY,
                        x2: midX, y2: topY + 40, // Drop down for horizontal branch
                    });

                    const horizontalBranchY = topY + 40;

                    // Collect children centers
                    const childrenCenters = node.childrenIds
                        .map(childId => getNodeCenter(childId))
                        .filter(p => p.x !== 0); // Filter out nodes not yet rendered/found

                    if (childrenCenters.length > 0) {
                        const minChildX = Math.min(...childrenCenters.map(c => c.x));
                        const maxChildX = Math.max(...childrenCenters.map(c => c.x));

                        // Horizontal line connecting children
                        lines.push({
                            type: 'line',
                            x1: minChildX, y1: horizontalBranchY,
                            x2: maxChildX, y2: horizontalBranchY,
                        });

                        // Vertical lines from horizontal branch to each child
                        childrenCenters.forEach(childCenter => {
                            lines.push({
                                type: 'path',
                                d: `M${childCenter.x},${horizontalBranchY} V${childCenter.y - 50}`, // Path to just above child circle
                                markerEnd: 'url(#arrowhead)',
                            });
                        });
                    }
                }
            }
        });

        return lines;
    }, [data, getNodeCenter]);

    // Effect to update SVG dimensions and redraw lines on mount and resize
    useEffect(() => {
        const updateAndDraw = () => {
            if (containerRef.current) {
                setSvgDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
                // Give a small delay to ensure all nodes are rendered and positioned
                // This is crucial for accurate getNodeCenter calculations
                setTimeout(() => {
                    drawLines();
                }, 100); // Increased delay slightly for more stability
            }
        };

        // Initial draw
        updateAndDraw();

        // Add resize listener
        window.addEventListener('resize', updateAndDraw);
        return () => window.removeEventListener('resize', updateAndDraw);
    }, [drawLines]);


    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[650px] family-tree-display-container"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))', // 6 columns for flexibility
                gridTemplateRows: 'repeat(3, minmax(180px, 1fr))', // 3 rows, adjust height as needed
                gap: '10px 20px', // Row gap, column gap
                placeItems: 'center', // Center items in their grid cells
                padding: '20px',
            }}
        >
            {/* SVG Overlay for drawing lines */}
            <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}>
                {/* Arrowhead definition */}
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="7" // Position relative to end of line
                        refY="3.5"
                        orient="auto" // Orient with the path
                    >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#777" /> {/* Fill color matches line stroke */}
                    </marker>
                </defs>

                {/* Render all calculated lines */}
                {drawLines().map((line, index) => {
                    if (line.type === 'line') {
                        return (
                            <line
                                key={index}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#777"
                                strokeWidth="2"
                                shapeRendering="crispEdges"
                            />
                        );
                    } else if (line.type === 'path') {
                        return (
                            <path
                                key={index}
                                d={line.d}
                                stroke="#777"
                                strokeWidth="2"
                                fill="none"
                                markerEnd={line.markerEnd}
                                shapeRendering="crispEdges"
                            />
                        );
                    }
                    return null;
                })}
            </svg>

            {/* Render Member Nodes using CSS Grid positioning */}
            {data.map((member) => (
                <div
                    key={member.id}
                    style={{
                        gridColumn: `${member.col} / span 1`,
                        gridRow: `${member.row} / span 1`,
                    }}
                    className="flex justify-center items-center" // Center content within grid cell
                >
                    <MemberCard ref={el => nodeRefs.current[member.id] = el} member={member} onNodeClick={onNodeClick} />
                </div>
            ))}

            {/* Background dotted grid */}
            <style jsx>{`
                .family-tree-display-container {
                    background-image: radial-gradient(#e0e0e0 1px, transparent 0);
                    background-size: 20px 20px;
                    background-position: -19px -19px;
                }
            `}</style>
        </div>
    );
};

export default FamilyTreeDisplay;