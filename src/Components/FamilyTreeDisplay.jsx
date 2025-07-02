// src/Components/FamilyTreeDisplay.jsx
import React, { useCallback } from 'react';
import Tree from 'react-d3-tree';

// Custom node rendering component
const renderCustomNode = ({ nodeDatum, toggleNode, onNodeClick }) => {
    // Node dimensions for proper spacing and positioning
    const nodeWidth = 150; // Width of the entire node box (including image and label)
    const nodeHeight = 160; // Height of the entire node box

    // Offsets for the foreignObject (HTML content) relative to the SVG node's origin (0,0)
    const foreignObjectX = -nodeWidth / 2; // Center horizontally
    const foreignObjectY = -nodeHeight / 2 + 10; // Adjust vertically to align better

    const partner = nodeDatum.attributes?.partner;

    return (
        <g onClick={() => onNodeClick(nodeDatum)} style={{ cursor: 'pointer' }}>
            {/* ForeignObject allows embedding HTML within SVG */}
            <foreignObject x={foreignObjectX} y={foreignObjectY} width={nodeWidth} height={nodeHeight + (partner ? 80 : 0)}>
                <div
                    className="flex flex-col items-center justify-start p-1 relative"
                    style={{ width: '100%', height: '100%' }}
                    xmlns="http://www.w3.org/1999/xhtml" // Important for foreignObject content
                >
                    {/* Main Node (Image and Label) */}
                    <div className="flex flex-col items-center justify-center mb-2 flex-shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-1">
                            <img
                                src={nodeDatum.photo || 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=User'}
                                alt={nodeDatum.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/CCCCCC/FFFFFF?text=User"; }}
                            />
                        </div>
                        <div className={`px-4 py-1 rounded-md text-white font-semibold text-xs whitespace-nowrap ${nodeDatum.attributes?.color || 'bg-gray-500'} shadow`}>
                            {nodeDatum.name}
                        </div>
                    </div>

                    {/* Partner Node (only if `partner` attribute exists) - designed to be next to main node */}
                    {partner && (
                        <div className="flex items-center justify-center relative -mt-4" style={{ zIndex: 1 }}> {/* Adjusted margin */}
                            {/* Line between partners, adjust positioning carefully */}
                            <div className="absolute w-24 h-0.5 bg-gray-400 top-1/2 left-1/2 -translate-x-1/2"></div>
                            <div className="flex flex-col items-center justify-center p-1 relative z-10 ml-12"> {/* Adjust ml for spacing */}
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-1">
                                    <img
                                        src={partner.photo || 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=User'}
                                        alt={partner.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/CCCCCC/FFFFFF?text=User"; }}
                                    />
                                </div>
                                <div className={`px-4 py-1 rounded-md text-white font-semibold text-xs whitespace-nowrap ${partner.color || 'bg-gray-500'} shadow`}>
                                    {partner.name}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </foreignObject>
        </g>
    );
};

// Custom path function for angular lines
const customPathFunc = (linkDatum, orientation) => {
    const { source, target } = linkDatum;
    // This creates a vertical-horizontal-vertical path
    const path = `M${source.x},${source.y} V${(source.y + target.y) / 2} H${target.x} V${target.y}`;
    return path;
};


const FamilyTreeDisplay = ({ data, onNodeClick }) => {
    const treeContainerRef = React.useRef(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        if (treeContainerRef.current) {
            setDimensions({
                width: treeContainerRef.current.offsetWidth,
                height: treeContainerRef.current.offsetHeight,
            });
        }
    }, []);

    // Memoize the render function to prevent unnecessary re-renders
    const memoizedRenderCustomNode = useCallback((props) => renderCustomNode({ ...props, onNodeClick }), [onNodeClick]);

    return (
        <div ref={treeContainerRef} style={{ width: '100%', height: '100%' }}>
            {dimensions.width > 0 && dimensions.height > 0 && (
                <Tree
                    data={data}
                    orientation="vertical"
                    nodeSize={{ x: 200, y: 250 }} // Adjust for spacing
                    translate={{ x: dimensions.width / 2, y: 50 }} // Center root node
                    collapsible={true}
                    enablePanAndZoom={true}
                    zoom={0.8}
                    scaleExtent={{ min: 0.1, max: 2 }}
                    pathFunc={customPathFunc} // Use the custom path function
                    renderCustomNodeElement={memoizedRenderCustomNode}
                    styles={{
                        links: {
                            stroke: '#999',
                            strokeWidth: 2,
                            fill: 'none',
                        },
                    }}
                    svgClassName="family-tree-svg" // Class for global CSS targeting
                >
                    {/* Arrowhead definition inside the Tree component */}
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="7"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
                        </marker>
                    </defs>
                </Tree>
            )}
        </div>
    );
};

export default FamilyTreeDisplay;