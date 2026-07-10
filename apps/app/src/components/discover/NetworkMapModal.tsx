"use client";

import { useEffect, useState, useMemo } from "react";
import { X, Shield, Users, Info, GraduationCap } from "lucide-react";
import { Avatar } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";

interface ProfileNode {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  university: string | null;
  city: string | null;
  isMutual?: boolean;
  connections?: ProfileNode[];
}

interface NetworkMapData {
  root: ProfileNode;
  connections: ProfileNode[];
}

interface NetworkMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function NetworkMapModal({ isOpen, onClose, userId, userName }: NetworkMapModalProps) {
  const [data, setData] = useState<NetworkMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchMap = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/network/map/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch connection map");
        const json = await res.json();
        if (isMounted) {
          setData(json);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchMap();
    return () => {
      isMounted = false;
    };
  }, [isOpen, userId]);

  // Calculate Layout Positions (cx, cy = 300, 300 on a 600x600 canvas)
  const layout = useMemo(() => {
    if (!data) return null;

    const cx = 300;
    const cy = 300;
    const r1 = 120; // Radius for 1st-degree
    const r2 = 75;  // Radius for 2nd-degree branches

    const nodes: any[] = [];
    const lines: any[] = [];

    // 1. Root Node
    const rootNode = {
      id: data.root.id,
      display_name: data.root.display_name,
      username: data.root.username,
      avatar_url: data.root.avatar_url,
      university: data.root.university,
      city: data.root.city,
      x: cx,
      y: cy,
      degree: "root",
    };
    nodes.push(rootNode);

    const firstDegreeCount = data.connections.length;

    // 2. 1st-Degree Nodes & Lines
    data.connections.forEach((conn1, i) => {
      const angle = (2 * Math.PI * i) / firstDegreeCount - Math.PI / 2; // Offset by -90 deg
      const x1 = cx + r1 * Math.cos(angle);
      const y1 = cy + r1 * Math.sin(angle);

      const conn1Node = {
        id: conn1.id,
        display_name: conn1.display_name,
        username: conn1.username,
        avatar_url: conn1.avatar_url,
        university: conn1.university,
        city: conn1.city,
        x: x1,
        y: y1,
        degree: conn1.isMutual ? "mutual" : "1st",
        isMutual: conn1.isMutual,
      };
      nodes.push(conn1Node);

      lines.push({
        x1: cx,
        y1: cy,
        x2: x1,
        y2: y1,
        type: conn1.isMutual ? "mutual" : "1st",
      });

      // 3. 2nd-Degree Nodes & Lines
      const secondDegree = conn1.connections || [];
      const secondDegreeCount = secondDegree.length;

      secondDegree.forEach((conn2, j) => {
        // Distribute 2nd-degree nodes in a branching arc centered around the 1st-degree angle
        const arcSpread = Math.PI / 3; // 60 degrees total spread
        let branchAngle = angle;
        if (secondDegreeCount > 1) {
          branchAngle = angle - arcSpread / 2 + (arcSpread * j) / (secondDegreeCount - 1);
        } else if (secondDegreeCount === 1) {
          branchAngle = angle;
        }

        const x2 = x1 + r2 * Math.cos(branchAngle);
        const y2 = y1 + r2 * Math.sin(branchAngle);

        nodes.push({
          id: conn2.id,
          display_name: conn2.display_name,
          username: conn2.username,
          avatar_url: conn2.avatar_url,
          university: conn2.university,
          city: conn2.city,
          x: x2,
          y: y2,
          degree: "2nd",
        });

        lines.push({
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
          type: "2nd",
        });
      });
    });

    return { nodes, lines };
  }, [data]);

  if (!isOpen) return null;

  const handleNodeHover = (node: any, e: React.MouseEvent) => {
    const container = e.currentTarget.getBoundingClientRect();
    setHoveredNode(node);
    setTooltipPos({
      x: node.x,
      y: node.y - 45, // Place tooltip above the node
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/90 dark:bg-slate-950/95 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col h-[650px] relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-lg leading-tight">
                Connection Network
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Matched relationships for {userName.split(" ")[0]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 py-2 px-6 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-brand-100" />
            <span>Root Profile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-peach-500 ring-4 ring-peach-100" />
            <span>Mutual (1st Degree)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 ring-4 ring-slate-200" />
            <span>1st Degree (Roommate)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-slate-100" />
            <span>2nd Degree</span>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-auto bg-slate-50/50 relative flex items-center justify-center min-h-0">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Loading network node map...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 space-y-3">
              <p className="text-sm text-red-500 font-semibold">{error}</p>
              <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
            </div>
          ) : data && data.connections.length === 0 ? (
            <div className="text-center p-6 max-w-xs space-y-2">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-700 text-sm">No connections yet</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once {userName.split(" ")[0]} signs a roommate agreement, their network nodes tree will be displayed here.
              </p>
            </div>
          ) : layout ? (
            /* Interactive Tree View */
            <div className="relative w-[600px] h-[600px] flex-shrink-0">
              
              {/* SVG Network Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="mutual-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2A7B4C" /> {/* brand */}
                    <stop offset="100%" stopColor="#F2994A" /> {/* peach */}
                  </linearGradient>
                </defs>
                {layout.lines.map((line, idx) => {
                  let stroke = "#E2E8F0"; // Default line color
                  let strokeWidth = 2;
                  let strokeDash = "0";

                  if (line.type === "mutual") {
                    stroke = "url(#mutual-grad)";
                    strokeWidth = 3;
                  } else if (line.type === "1st") {
                    stroke = "#1E293B"; // slate-800
                    strokeWidth = 2.5;
                  } else if (line.type === "2nd") {
                    stroke = "#94A3B8"; // slate-400
                    strokeWidth = 1.5;
                    strokeDash = "3, 3"; // Dashed line for 2nd degree
                  }

                  return (
                    <line
                      key={idx}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDash}
                      className="opacity-75"
                    />
                  );
                })}
              </svg>

              {/* Interactive Hover Nodes */}
              {layout.nodes.map((node) => {
                let border = "border-2 border-slate-300";
                let size = "w-10 h-10";

                if (node.degree === "root") {
                  border = "border-[3px] border-brand-500 ring-4 ring-brand-100 animate-pulse";
                  size = "w-14 h-14";
                } else if (node.degree === "mutual") {
                  border = "border-[3px] border-peach-500 ring-4 ring-peach-100";
                  size = "w-11 h-11";
                } else if (node.degree === "1st") {
                  border = "border-2 border-slate-800 ring-4 ring-slate-100";
                  size = "w-11 h-11";
                } else if (node.degree === "2nd") {
                  border = "border border-slate-400 bg-slate-50";
                  size = "w-8 h-8";
                }

                return (
                  <div
                    key={node.id}
                    className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 select-none group"
                    style={{ left: node.x, top: node.y }}
                    onMouseEnter={(e) => handleNodeHover(node, e)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <div className={`rounded-full overflow-hidden shadow-md transition-all duration-150 group-hover:scale-110 active:scale-95 ${border} ${size}`}>
                      <Avatar
                        src={node.avatar_url}
                        name={node.display_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Glassmorphic Tooltip */}
              {hoveredNode && (
                <div
                  className="absolute pointer-events-none bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl p-3 shadow-xl z-30 flex flex-col gap-1 -translate-x-1/2 -translate-y-full w-48 text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150"
                  style={{ left: tooltipPos.x, top: tooltipPos.y }}
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={hoveredNode.avatar_url}
                      name={hoveredNode.display_name}
                      size="xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {hoveredNode.display_name}
                      </p>
                      {hoveredNode.username && (
                        <p className="text-[10px] text-slate-400 font-semibold truncate">
                          @{hoveredNode.username}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-[1px] bg-slate-100 my-1" />
                  
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {hoveredNode.degree === "root" && "Target User"}
                    {hoveredNode.degree === "mutual" && "Mutual Connection"}
                    {hoveredNode.degree === "1st" && "1st Degree Roommate"}
                    {hoveredNode.degree === "2nd" && "2nd Degree Connections"}
                  </p>

                  {hoveredNode.university && (
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{hoveredNode.university}</span>
                    </p>
                  )}
                </div>
              )}

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
