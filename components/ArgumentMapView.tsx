import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { AnalysisReport, ArgumentNode, ArgumentEdge, ArgumentNodeType } from '../types.ts';
import { generateArgumentText } from '../services/geminiService.ts';
import { Loader } from './Loader.tsx';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';

// --- Helper Components & Functions ---

// Declare html2canvas from global scope
declare var html2canvas: any;

const nodeTypeMeta: Record<ArgumentNodeType, { color: string, label: string }> = {
    legalIssue: { color: 'bg-red-100 border-red-400', label: 'Vấn đề pháp lý' },
    strength: { color: 'bg-green-100 border-green-400', label: 'Điểm mạnh' },
    weakness: { color: 'bg-amber-100 border-amber-400', label: 'Điểm yếu' },
    risk: { color: 'bg-orange-100 border-orange-400', label: 'Rủi ro' },
    timelineEvent: { color: 'bg-sky-100 border-sky-400', label: 'Sự kiện' },
    applicableLaw: { color: 'bg-indigo-100 border-indigo-400', label: 'Cơ sở pháp lý' },
    loophole: { color: 'bg-purple-100 border-purple-400', label: 'Lỗ hổng pháp lý' },
    custom: { color: 'bg-slate-100 border-slate-400', label: 'Ghi chú' },
};

const ArgumentNodeComponent: React.FC<{
    node: ArgumentNode;
    onDragStart: (e: React.MouseEvent, id: string) => void;
    isSelected: boolean;
    onClick: (e: React.MouseEvent, id: string) => void;
}> = ({ node, onDragStart, isSelected, onClick }) => {
    const meta = nodeTypeMeta[node.type] || nodeTypeMeta.custom;
    const selectionClass = isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300';

    return (
        <div
            id={`node-${node.id}`}
            className={`absolute p-3 rounded-lg shadow-md cursor-grab active:cursor-grabbing text-xs text-slate-800 w-48 ${meta.color} border-2 ${selectionClass} transition-all duration-150`}
            style={{ left: node.position.x, top: node.position.y }}
            onMouseDown={(e) => onDragStart(e, node.id)}
            onClick={(e) => onClick(e, node.id)}
        >
            <div className="font-bold mb-1">{node.label}</div>
            <p className="line-clamp-4">{node.content}</p>
        </div>
    );
};

const ArgumentEdgeComponent: React.FC<{
    edge: ArgumentEdge;
    nodes: ArgumentNode[];
}> = ({ edge, nodes }) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;

    // Center of nodes (width: 192px, height: depends on content but we estimate)
    const x1 = sourceNode.position.x + 96;
    const y1 = sourceNode.position.y + 40;
    const x2 = targetNode.position.x + 96;
    const y2 = targetNode.position.y + 40;
    
    return (
        <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-slate-400" strokeWidth="2" markerEnd="url(#arrowhead)" />
    );
};


interface ArgumentEditorProps {
    selectedNodes: ArgumentNode[];
    onDownload: () => void;
    isDownloading: boolean;
}
const ArgumentEditor: React.FC<ArgumentEditorProps> = ({ selectedNodes, onDownload, isDownloading }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedText, setGeneratedText] = useState('');

    useEffect(() => {
        // Clear generated text when selection changes
        setGeneratedText('');
        setError(null);
    }, [selectedNodes]);


    const handleGenerate = async () => {
        if (selectedNodes.length === 0) return;
        setIsLoading(true);
        setError(null);
        setGeneratedText('');
        try {
            const result = await generateArgumentText(selectedNodes);
            setGeneratedText(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 p-4">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-base font-bold text-slate-800">Soạn thảo Luận cứ</h3>
                 <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 disabled:opacity-50"
                    title="Tải bản đồ về dưới dạng ảnh"
                >
                    {isDownloading ? <Loader /> : <DownloadIcon className="w-4 h-4" />}
                    <span>Tải ảnh</span>
                </button>
            </div>
            <div className="flex-grow bg-white border rounded-lg p-3 text-sm space-y-2 overflow-y-auto mb-4 min-h-[150px]">
                <p className="text-xs text-slate-500 mb-2">Chọn các khối trên bản đồ (giữ phím Shift để chọn nhiều) để cung cấp bối cảnh cho AI.</p>
                {selectedNodes.length > 0 ? (
                    selectedNodes.map(node => {
                        const meta = nodeTypeMeta[node.type] || nodeTypeMeta.custom;
                        return (
                            <div key={node.id} className={`p-1.5 rounded text-xs border ${meta.color}`}>
                                <span className="font-bold">{node.label}:</span> {node.content.substring(0, 50)}...
                            </div>
                        )
                    })
                ) : (
                    <p className="text-slate-400 text-center py-4">Chưa có khối nào được chọn.</p>
                )}
            </div>
            <button
                onClick={handleGenerate}
                disabled={isLoading || selectedNodes.length === 0}
                className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2 mb-4"
            >
                {isLoading ? <><Loader /> <span>Đang tạo...</span></> : <><MagicIcon className="w-5 h-5"/>Tạo Luận cứ</>}
            </button>
            <div className="flex-grow-[2] relative">
                <textarea
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    placeholder={isLoading ? "AI đang soạn thảo..." : "Kết quả sẽ xuất hiện ở đây..."}
                    className="w-full h-full p-3 bg-white border border-slate-200 rounded-lg shadow-inner text-sm font-sans"
                    readOnly={isLoading}
                />
                 {generatedText && (
                    <button onClick={() => navigator.clipboard.writeText(generatedText)} className="absolute top-2 right-2 bg-slate-200 text-slate-700 px-2 py-1 text-xs font-semibold rounded-md hover:bg-slate-300">
                        Copy
                    </button>
                )}
            </div>
             {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
    );
};


// --- Main Component ---
interface ArgumentMapViewProps {
    report: AnalysisReport | null;
    onUpdateReport: (report: AnalysisReport) => void;
}

export const ArgumentMapView: React.FC<ArgumentMapViewProps> = ({ report }) => {
    const [nodes, setNodes] = useState<ArgumentNode[]>([]);
    const [edges, setEdges] = useState<ArgumentEdge[]>([]);
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [isDownloading, setIsDownloading] = useState(false);
    
    const draggingNode = useRef<{ id: string; offset: { x: number; y: number } } | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (report?.argumentGraph) {
            setNodes(report.argumentGraph.nodes);
            setEdges(report.argumentGraph.edges);
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [report]);

    const handleDownloadImage = async () => {
        if (!mapContentRef.current || nodes.length === 0 || typeof html2canvas === 'undefined') {
            alert("Bản đồ trống hoặc thư viện chưa sẵn sàng.");
            return;
        }
        setIsDownloading(true);

        const mapElement = mapContentRef.current;
        const PADDING = 50;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            const nodeElement = document.getElementById(`node-${node.id}`);
            if (nodeElement) {
                minX = Math.min(minX, nodeElement.offsetLeft);
                minY = Math.min(minY, nodeElement.offsetTop);
                maxX = Math.max(maxX, nodeElement.offsetLeft + nodeElement.offsetWidth);
                maxY = Math.max(maxY, nodeElement.offsetTop + nodeElement.offsetHeight);
            }
        });
        
        if (minX === Infinity) { // Fallback if nodes aren't rendered yet
             minX = 0; minY = 0; maxX = 1000; maxY = 800;
        }

        try {
            const canvas = await html2canvas(mapElement, {
                x: minX - PADDING,
                y: minY - PADDING,
                width: (maxX - minX) + PADDING * 2,
                height: (maxY - minY) + PADDING * 2,
                scale: 2, // for higher quality
                backgroundColor: '#f8fafc', // background color of map
                useCORS: true
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'ban_do_lap_luan.png';
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Đã xảy ra lỗi khi tạo ảnh từ bản đồ.");
        } finally {
            setIsDownloading(false);
        }
    };


    const handleNodeDragStart = (e: React.MouseEvent, id: string) => {
        // Prevent text selection while dragging
        e.preventDefault();
        const node = nodes.find(n => n.id === id);
        if (!node || !mapRef.current) return;
        const mapRect = mapRef.current.getBoundingClientRect();
        
        // Clicks on interactive elements inside the node should not start a drag
        if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'A') {
            return;
        }

        draggingNode.current = {
            id,
            offset: {
                x: e.clientX - node.position.x,
                y: e.clientY - node.position.y,
            },
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingNode.current || !mapRef.current) return;
        
        const newX = e.clientX - draggingNode.current.offset.x;
        const newY = e.clientY - draggingNode.current.offset.y;

        setNodes(prevNodes =>
            prevNodes.map(n =>
                n.id === draggingNode.current?.id
                    ? { ...n, position: { x: newX, y: newY } }
                    : n
            )
        );
    };

    const handleMouseUp = () => {
        draggingNode.current = null;
    };
    
    const handleNodeClick = (e: React.MouseEvent, id: string) => {
        const isShiftClick = e.shiftKey;
        setSelectedNodeIds(prev => {
            const newSelection = new Set(prev);
            if (isShiftClick) {
                if (newSelection.has(id)) {
                    newSelection.delete(id);
                } else {
                    newSelection.add(id);
                }
            } else {
                 if (newSelection.has(id) && newSelection.size === 1) {
                    newSelection.clear(); // Deselect if clicking the only selected node
                } else {
                    newSelection.clear();
                    newSelection.add(id);
                }
            }
            return newSelection;
        });
    };
    
    const handleCanvasClick = (e: React.MouseEvent) => {
        // Deselect all nodes if clicking on the canvas itself
        if (e.target === mapRef.current) {
            setSelectedNodeIds(new Set());
        }
    };

    const selectedNodes = useMemo(() => {
        return nodes.filter(node => selectedNodeIds.has(node.id));
    }, [nodes, selectedNodeIds]);

    if (!report || !report.argumentGraph || report.argumentGraph.nodes.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-full text-center text-slate-500 bg-slate-50 rounded-lg border">
                <div className="max-w-md">
                    <h3 className="text-xl font-bold text-slate-700">Bản đồ Lập luận Trống</h3>
                    <p className="mt-2">Không tìm thấy dữ liệu để tạo bản đồ. Vui lòng chạy phân tích vụ việc trước. Kết quả phân tích phải chứa mục "argumentGraph" do AI tạo ra.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-12 w-full h-full gap-0">
            <div 
                className="col-span-8 bg-slate-100/50 rounded-l-lg relative overflow-auto"
                ref={mapRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves canvas
                onClick={handleCanvasClick}
            >
                <div className="relative w-[2000px] h-[2000px]" ref={mapContentRef}>
                    <svg className="absolute w-full h-full pointer-events-none">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                            </marker>
                        </defs>
                        {edges.map(edge => (
                            <ArgumentEdgeComponent key={edge.id} edge={edge} nodes={nodes} />
                        ))}
                    </svg>
                    {nodes.map(node => (
                        <ArgumentNodeComponent
                            key={node.id}
                            node={node}
                            onDragStart={handleNodeDragStart}
                            isSelected={selectedNodeIds.has(node.id)}
                            onClick={handleNodeClick}
                        />
                    ))}
                </div>
            </div>
            <div className="col-span-4 h-full">
                <ArgumentEditor 
                    selectedNodes={selectedNodes} 
                    onDownload={handleDownloadImage}
                    isDownloading={isDownloading}
                />
            </div>
        </div>
    );
};