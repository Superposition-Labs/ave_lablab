# protocol.py

from typing import Any, List

import networkx as nx
from pydantic import BaseModel, Field


class SocialGraph(BaseModel):
    graph: Any = Field(default_factory=nx.Graph)

    def __init__(self, agents):
        super().__init__(graph=nx.Graph())
        for agent, data in agents.items():
            self.graph.add_node(agent, skills=data["skills"])
            for link in data["links"]:
                self.graph.add_edge(agent, link)

    def get_neighbors(self, agent, depth=1):
        return list(nx.single_source_shortest_path_length(self.graph, agent, cutoff=depth).keys())

    def get_path(self, source, target):
        try:
            return nx.shortest_path(self.graph, source, target)
        except nx.NetworkXNoPath:
            return None


def find_potential_peers(
    task_description: str,
    agent_id: str,
    social_graph: SocialGraph,
    search_depth: int = 2,
) -> List[str]:
    if not task_description or not agent_id or not social_graph:
        return []

    potential_peers = []
    neighbors = social_graph.get_neighbors(agent_id, depth=search_depth)
    for neighbor in neighbors:
        if neighbor == agent_id:
            continue
        agent_skills = social_graph.graph.nodes[neighbor]["skills"]
        if any(skill.lower() in task_description.lower() for skill in agent_skills):
            potential_peers.append(neighbor)
    return potential_peers