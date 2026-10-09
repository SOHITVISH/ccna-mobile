import type { AssessmentOption, AssessmentQuestion } from "../assessmentTypes";

type Choice = [string, string];
type Choices = [Choice, Choice, Choice, Choice];

const makeOptions = (
  id: string,
  choices: Choices
): [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption] => {
  const makeOption = (choice: Choice, index: number): AssessmentOption => ({
    id: `${id}-${String.fromCharCode(97 + index)}`,
    text: choice[0],
    explanation: choice[1]
  });
  return [
    makeOption(choices[0], 0),
    makeOption(choices[1], 1),
    makeOption(choices[2], 2),
    makeOption(choices[3], 3)
  ];
};

const answerId = (id: string, index: number) => `${id}-${String.fromCharCode(97 + index)}`;

const single = (
  topicId: string,
  id: string,
  prompt: string,
  answer: number,
  choices: Choices
): AssessmentQuestion => ({
  id,
  topicId,
  prompt,
  type: "single",
  options: makeOptions(id, choices),
  answerIds: [answerId(id, answer)]
});

const multi = (
  topicId: string,
  id: string,
  prompt: string,
  answers: [number, number],
  choices: Choices
): AssessmentQuestion => ({
  id,
  topicId,
  prompt,
  type: "multi-select",
  options: makeOptions(id, choices),
  answerIds: answers.map((answer) => answerId(id, answer))
});

const simlet = (
  topicId: string,
  id: string,
  prompt: string,
  output: string,
  answers: [number, number],
  choices: Choices
): AssessmentQuestion => ({
  id,
  topicId,
  prompt,
  type: "simlet",
  output,
  options: makeOptions(id, choices),
  answerIds: answers.map((answer) => answerId(id, answer))
});

const ordering = (
  topicId: string,
  id: string,
  prompt: string,
  steps: Choices
): AssessmentQuestion => {
  const items = makeOptions(id, steps);
  return {
    id,
    topicId,
    prompt,
    type: "ordering",
    items,
    correctOrder: [items[0].id, items[1].id, items[2].id, items[3].id]
  };
};

export const ccnaRoutingServicesQuestions: AssessmentQuestion[] = [
  single("routing-table", "routing-table-s1", "A router has a matching route for 172.20.8.0/24 via 10.0.0.2. What does the next-hop address identify?", 1, [
    ["The destination host's MAC address", "A route entry does not store the remote host's Layer 2 address."],
    ["The adjacent router to which packets are forwarded", "The next hop is the IP address of the next Layer 3 router on the path."],
    ["The source address assigned to outgoing packets", "Forwarding does not change the packet source merely because a route is selected."],
    ["The network's directed broadcast address", "The next-hop field identifies a forwarding neighbor, not a broadcast address."]
  ]),
  single("routing-table", "routing-table-s2", "Which route would normally be installed for a subnet directly attached to an operational interface?", 0, [
    ["A connected route", "An up/up interface contributes its directly connected prefix to the routing table."],
    ["An external OSPF route", "External OSPF routes are learned from redistributed information, not simply from a local interface."],
    ["A floating static route", "A floating static route is a backup route configured with a less-preferred administrative distance."],
    ["A default route", "A default route covers otherwise unmatched destinations, not specifically an attached subnet."]
  ]),
  single("routing-table", "routing-table-s3", "A routing table entry shows [110/25] beside an OSPF prefix. What do these two values represent?", 2, [
    ["Prefix length and next-hop distance", "The bracketed pair does not encode the prefix length or hop count."],
    ["OSPF process ID and interface number", "Process IDs and interface numbers are not the route-code pair shown in this format."],
    ["Administrative distance and route metric", "The first value is administrative distance; the second is the protocol's metric."],
    ["Route age and packet count", "Neither value in the bracketed route notation represents age or traffic counters."]
  ]),
  single("routing-table", "routing-table-s4", "A router has no more-specific route for a destination, but has 0.0.0.0/0 via 192.0.2.1. Which entry is used?", 3, [
    ["The first connected route listed", "Route table display order does not make an unrelated connected prefix match."],
    ["The route with the lowest next-hop address", "Next-hop numeric value does not determine route selection."],
    ["The route learned most recently", "Recency alone is not the forwarding selection rule."],
    ["The default route", "A /0 matches any IPv4 destination that lacks a more-specific matching route."]
  ]),
  multi("routing-table", "routing-table-m1", "Which two fields commonly help identify how a router will forward traffic for a selected route?", [0, 3], [
    ["Outgoing interface", "The interface indicates where the packet leaves the router."],
    ["Source MAC address of the original sender", "A router does not retain the sender's Layer 2 source MAC as a route field."],
    ["DNS name of the destination", "DNS names are not required to make a route-table forwarding decision."],
    ["Next-hop address", "For a routed path, the next hop identifies the adjacent Layer 3 recipient."]
  ]),
  multi("routing-table", "routing-table-m2", "Which two statements about entries in an IPv4 routing table are accurate?", [1, 2], [
    ["Every entry is a manually configured static route", "Entries can be connected, local, static, or learned dynamically."],
    ["The prefix states which destination addresses can match", "A route prefix defines the destination range used during lookup."],
    ["A route code can indicate how the route was learned", "Codes such as connected, static, or OSPF identify the source category."],
    ["The listed metric is the packet's remaining TTL", "TTL belongs to the packet header and is unrelated to a route metric."]
  ]),
  ordering("routing-table", "routing-table-o1", "Order the main routing-table lookup steps for a packet with a known destination IP.", [
    ["Read the packet's destination IP", "The lookup begins with the destination address in the received packet."],
    ["Find matching destination prefixes", "The router compares that address with the prefixes in its routing table."],
    ["Select the best matching route", "Among matches, the most specific route wins, with route preference resolving equivalent prefixes."],
    ["Resolve the next hop and output interface", "The selected route supplies the forwarding adjacency and egress interface."]
  ]),
  simlet("routing-table", "routing-table-r1", "Based on this illustrative table, which two facts describe forwarding toward 10.4.2.9?", `R1# show ip route
O 10.4.2.0/24 [110/20] via 192.0.2.6, GigabitEthernet0/1
C 10.4.0.0/16 is directly connected, GigabitEthernet0/0
S* 0.0.0.0/0 [1/0] via 192.0.2.1`, [0, 2], [
    ["The /24 OSPF route is selected", "10.4.2.9 matches the /24, which is more specific than the connected /16."],
    ["The default route is preferred because it is static", "The default prefix is less specific than the matching /24."],
    ["The outgoing interface is GigabitEthernet0/1", "The selected OSPF entry specifies Gi0/1 as its egress interface."],
    ["The router sends directly on GigabitEthernet0/0", "The /16 is a less-specific match, so it is not selected."]
  ]),

  single("route-selection", "route-selection-s1", "Two routes match a destination: 10.8.4.0/24 and 10.8.0.0/16. Which principle decides between them?", 2, [
    ["Choose the route with the numerically larger next hop", "Next-hop magnitude does not determine which matching prefix is preferred."],
    ["Choose the route with the lower interface number", "Interface numbering has no bearing on prefix specificity."],
    ["Use longest-prefix match and select /24", "The /24 covers a narrower range and is the most specific matching route."],
    ["Always select the default route", "A default route is used only when there is no better matching route."]
  ]),
  single("route-selection", "route-selection-s2", "A router learns the same prefix from two protocols. What does administrative distance compare?", 0, [
    ["The relative preference of route sources", "Administrative distance is used to prefer one source of a route over another for the same prefix."],
    ["The number of router hops to the destination", "Hop count is a metric used by some protocols, not administrative distance."],
    ["The network's address-space size", "Prefix length describes address-space size; administrative distance does not."],
    ["The bandwidth of the outgoing interface", "Bandwidth can influence certain protocol metrics but is not what administrative distance represents."]
  ]),
  single("route-selection", "route-selection-s3", "For two routes to the same prefix learned by the same routing protocol, which value generally compares path cost?", 3, [
    ["Destination MAC address", "Layer 2 addressing is not a route-path preference measure."],
    ["Administrative distance between protocols", "Within one protocol, the protocol metric typically compares candidate paths."],
    ["ARP cache age", "ARP aging does not rank routes."],
    ["The protocol metric", "Metrics such as OSPF cost compare paths within a routing protocol."]
  ]),
  single("route-selection", "route-selection-s4", "A static backup route is configured with a higher administrative distance than the primary route. What is its intended behavior?", 1, [
    ["It always replaces the primary route", "A higher administrative distance makes the static route less preferred while both are available."],
    ["It can enter the table if the preferred route disappears", "The higher-distance static route can provide a backup when the primary route is withdrawn."],
    ["It wins only for packets with a larger TTL", "TTL does not affect route-source preference."],
    ["It changes the prefix to a default route", "Administrative distance does not alter the configured destination prefix."]
  ]),
  multi("route-selection", "route-selection-m1", "Which two statements correctly describe route selection?", [0, 2], [
    ["Longest-prefix match determines the most specific matching destination route", "Specificity is the primary forwarding lookup rule among matching prefixes."],
    ["The route with the smallest metric always beats every other route source", "Metrics are not directly comparable across routing protocols; route-source preference also matters."],
    ["Administrative distance can prefer one route source for the same prefix", "It is used to compare route sources for otherwise competing routes."],
    ["A more-specific route is ignored when a default exists", "A matching specific route takes precedence over the /0 default."]
  ]),
  multi("route-selection", "route-selection-m2", "A destination matches both 192.168.0.0/16 and 192.168.50.0/24. Which two conclusions follow?", [1, 3], [
    ["The /16 wins because it contains more addresses", "A broader range is less specific and does not win longest-prefix matching."],
    ["The /24 is the selected prefix if both routes are installed", "The /24 is the longest matching prefix."],
    ["The route metric is compared before prefix length", "Prefix specificity determines the selected destination route before comparing route alternatives."],
    ["The chosen route covers a narrower destination range", "A longer prefix has fewer addresses and is more specific."]
  ]),
  ordering("route-selection", "route-selection-o1", "Order these checks when deciding which of several learned paths a router installs for a destination.", [
    ["Confirm the destination prefix is the same", "Administrative distance and protocol metrics compare candidate paths to the same prefix."],
    ["Compare route-source preference", "Administrative distance helps determine which source is preferred."],
    ["Compare the routing protocol's metric among comparable candidates", "Metric comparison selects a path within a protocol's route candidates."],
    ["Install the preferred route and use it for matching traffic", "The selected route becomes the forwarding entry for the prefix."]
  ]),
  simlet("route-selection", "route-selection-r1", "For destination 10.20.7.5, select the two accurate observations from this illustrative route listing.", `R2# show ip route 10.20.7.5
O 10.20.7.0/24 [110/30] via 192.0.2.2
S 10.20.0.0/16 [1/0] via 192.0.2.3
S* 0.0.0.0/0 [1/0] via 192.0.2.1`, [0, 2], [
    ["The OSPF /24 is the longest matching prefix", "It is more specific than either the /16 static or default route."],
    ["The static /16 wins because its distance is lower", "For forwarding lookup, the installed more-specific /24 takes precedence."],
    ["Traffic for 10.20.7.5 uses next hop 192.0.2.2", "That is the next hop on the selected /24 route."],
    ["The default route wins because it is marked with an asterisk", "The asterisk denotes a candidate default route, not a preference over a specific match."]
  ]),

  single("static-routes", "static-routes-s1", "Which IPv4 static route syntax specifies 203.0.113.0/24 through next-hop router 192.0.2.9?", 1, [
    ["ip route 192.0.2.9 255.255.255.0 203.0.113.0", "The destination network and next hop are reversed, and the mask belongs with the destination."],
    ["ip route 203.0.113.0 255.255.255.0 192.0.2.9", "This specifies the destination network and mask followed by the next-hop address."],
    ["ip route 203.0.113.0/24 255.255.255.0", "This syntax mixes prefix notation with a mask and omits a forwarding next hop/interface."],
    ["ipv6 route 203.0.113.0/24 192.0.2.9", "The IPv6 route command cannot configure an IPv4 destination."]
  ]),
  single("static-routes", "static-routes-s2", "What destination prefix does an IPv4 default static route use?", 3, [
    ["255.255.255.255/32", "That is the limited broadcast host route, not a default."],
    ["127.0.0.0/8", "This is IPv4 loopback space and does not represent all unmatched destinations."],
    ["192.0.2.0/24", "This is a documentation prefix, not the special default prefix."],
    ["0.0.0.0/0", "A /0 has no fixed network bits and matches any IPv4 destination not matched more specifically."]
  ]),
  single("static-routes", "static-routes-s3", "When might a static route specify an exit interface rather than an IP next hop?", 0, [
    ["On a point-to-point link where the egress interface unambiguously identifies the path", "A point-to-point interface has one possible peer, so an interface-only route is unambiguous."],
    ["To resolve a remote Ethernet neighbor without ARP", "An Ethernet segment can have many neighbors; an interface-only route may require ARP for each destination."],
    ["To make the destination prefix dynamic", "An exit interface does not make a static route dynamic."],
    ["Only when the destination is IPv6 multicast", "Static exit interfaces are not limited to IPv6 multicast."]
  ]),
  single("static-routes", "static-routes-s4", "Why can an IPv6 link-local address used as a static-route next hop require an outgoing interface?", 2, [
    ["Link-local addresses are globally unique", "Link-local scope is limited to a local link, not globally unique."],
    ["IPv6 routing ignores next-hop addresses", "IPv6 routes can use next-hop addresses as well as exit interfaces."],
    ["The same link-local range exists on multiple interfaces", "An interface scope identifies which local link contains that next hop."],
    ["It converts the address to a global unicast prefix", "Specifying an interface does not change the address's scope or type."]
  ]),
  multi("static-routes", "static-routes-m1", "Which two are valid ways to define the forwarding path for a static route?", [0, 3], [
    ["Specify a reachable next-hop IP address", "A next-hop address tells the router which adjacent router should receive the packet."],
    ["Specify an arbitrary destination MAC address as the route", "Static IP routes are not configured by supplying a destination MAC address."],
    ["Set the route metric equal to the packet TTL", "TTL is a packet field and is unrelated to static-route configuration."],
    ["Specify an exit interface", "An outgoing interface can define where packets for the static prefix leave."]
  ]),
  multi("static-routes", "static-routes-m2", "Which two statements about static default routes are correct?", [1, 2], [
    ["A default route is used even when a more-specific route matches", "A more-specific matching route is preferred."],
    ["An IPv4 default prefix is 0.0.0.0/0", "The zero-length prefix matches any IPv4 destination."],
    ["It provides a path for destinations absent from more-specific entries", "That is the purpose of a default route."],
    ["It automatically discovers all upstream routers", "Static routes are manually specified and do not discover peers."]
  ]),
  ordering("static-routes", "static-routes-o1", "Order the configuration steps for a next-hop IPv4 static route to a remote LAN.", [
    ["Identify the destination network and subnet mask", "The route must first define which remote destinations it covers."],
    ["Identify a reachable next-hop router", "The chosen gateway must be reachable through an existing connected path."],
    ["Enter the destination, mask, and next hop in the route command", "These parameters define the static forwarding entry."],
    ["Verify the route appears and test reachability", "Confirm installation and then test the path beyond the local router."]
  ]),
  simlet("static-routes", "static-routes-r1", "Which two conclusions are supported by this illustrative route table?", `R3# show ip route static
S 198.51.100.0/24 [1/0] via 192.0.2.10
S* 0.0.0.0/0 [5/0] via 192.0.2.1`, [0, 3], [
    ["198.51.100.0/24 is routed via 192.0.2.10", "The specific static entry names that next hop."],
    ["All destinations use 192.0.2.10", "Only the 198.51.100.0/24 prefix uses that next hop."],
    ["The default route is preferred over the specific route", "The /24 is more specific for addresses within that network."],
    ["Unmatched destinations can use 192.0.2.1", "The 0.0.0.0/0 entry is a fallback for destinations without a more-specific route."]
  ]),

  single("ospf", "ospf-s1", "Which OSPFv2 packet type is used to discover and maintain neighbor relationships on a link?", 2, [
    ["Link-state request", "A link-state request asks for specific database information after adjacency formation."],
    ["Database description", "Database description packets summarize link-state database contents."],
    ["Hello", "Hello packets discover neighbors and support continued neighbor monitoring."],
    ["Link-state acknowledgment", "Acknowledgment packets confirm receipt of link-state updates."]
  ]),
  single("ospf", "ospf-s2", "Which value must match between two OSPF routers on a shared network for a normal adjacency to form?", 0, [
    ["Area ID", "Routers on a common OSPF link must agree on the area to form the expected adjacency."],
    ["Router ID", "Router IDs should be unique, not identical."],
    ["Interface description", "Description text is locally significant and is not exchanged as a matching requirement."],
    ["Host name", "OSPF neighbors do not need matching device hostnames."]
  ]),
  single("ospf", "ospf-s3", "What does the OSPF cost of an outgoing path represent?", 3, [
    ["The number of OSPF neighbors on the LAN", "Neighbor count is not the OSPF path metric."],
    ["The administrative distance of the route", "Administrative distance is separate from the OSPF cost metric."],
    ["The IPv4 prefix length", "Prefix length describes the network size rather than OSPF path cost."],
    ["A metric accumulated from interface costs along the path", "OSPF selects paths using accumulated costs."]
  ]),
  single("ospf", "ospf-s4", "Why should OSPF router IDs be unique within the routing domain?", 1, [
    ["They determine interface bandwidth", "Bandwidth influences cost but is not identified by the router ID."],
    ["They identify routers in OSPF messages and topology information", "A duplicate ID can cause ambiguous or unstable OSPF operation."],
    ["They encode the OSPF area number", "Router ID and area ID are different values."],
    ["They must equal the neighboring router's ID", "Neighbors need distinct router IDs."]
  ]),
  multi("ospf", "ospf-m1", "Which two conditions commonly prevent OSPF neighbors on the same IPv4 link from forming an adjacency?", [0, 2], [
    ["Mismatched area IDs on the shared link", "Routers must agree on the area associated with that link."],
    ["Different interface descriptions", "Descriptions are not a protocol adjacency parameter."],
    ["Incompatible hello/dead timer settings", "Timer mismatches can stop the routers from agreeing on neighbor liveness."],
    ["Different router IDs", "Unique router IDs are expected and do not by themselves prevent adjacency."]
  ]),
  multi("ospf", "ospf-m2", "Which two statements about single-area OSPFv2 are correct?", [1, 3], [
    ["OSPF distributes Ethernet frames between VLANs", "OSPF exchanges IP routing information; it does not bridge VLAN frames."],
    ["Routers flood link-state information and calculate paths from topology data", "Each router builds a link-state view and runs SPF to derive routes."],
    ["OSPF relies on TCP port 179 for neighbor updates", "Port 179 is associated with BGP; OSPF runs directly over IP."],
    ["A passive interface can advertise its network without forming neighbors there", "Passive mode suppresses neighbor formation while allowing the prefix to be advertised in common configurations."]
  ]),
  ordering("ospf", "ospf-o1", "Order these broad events as OSPF routers establish routing information over a shared link.", [
    ["Routers send Hello packets", "Hello packets begin neighbor discovery on the enabled link."],
    ["Compatible routers recognize one another as neighbors", "Matching network parameters allow the neighbor relationship to progress."],
    ["Routers exchange and synchronize link-state database information", "Database exchange builds a consistent topology view."],
    ["Each router runs SPF and installs eligible routes", "The local calculation derives best paths for the routing table."]
  ]),
  simlet("ospf", "ospf-r1", "What two conclusions can be drawn from this illustrative neighbor and route output?", `R4# show ip ospf neighbor
Neighbor ID     State     Address       Interface
2.2.2.2         FULL      192.0.2.2     Gi0/0
R4# show ip route ospf
O 10.40.0.0/16 [110/25] via 192.0.2.2, Gi0/0`, [0, 2], [
    ["Router ID 2.2.2.2 has a FULL neighbor relationship", "The neighbor table explicitly shows FULL state."],
    ["10.40.0.0/16 is directly connected to R4", "The O route code indicates it was learned through OSPF."],
    ["Traffic to 10.40.0.0/16 is forwarded toward 192.0.2.2", "The listed next hop is the OSPF neighbor's address."],
    ["The OSPF metric is the route's administrative distance", "In [110/25], 110 is administrative distance and 25 is the metric."]
  ]),

  single("first-hop-redundancy", "first-hop-redundancy-s1", "What address does a host normally use as its default gateway when a first-hop redundancy group is operating?", 1, [
    ["The standby router's physical interface address", "Hosts use the shared virtual gateway address, not specifically the standby's physical address."],
    ["The group's virtual IP address", "The virtual gateway remains the host's configured first hop as router roles change."],
    ["The OSPF router ID of the active router", "A router ID is not a host gateway address."],
    ["The switch's management address", "A Layer 2 switch management address does not serve as the routed default gateway."]
  ]),
  single("first-hop-redundancy", "first-hop-redundancy-s2", "In a first-hop redundancy group, what does the active router do?", 3, [
    ["Assigns new IP addresses to all clients", "Gateway redundancy does not replace client address assignment."],
    ["Blocks all traffic from standby routers", "The standby must monitor and be ready to take over."],
    ["Advertises every destination route to the Internet", "The active role concerns the virtual first hop, not global route advertisement."],
    ["Forwards host traffic addressed to the virtual gateway", "The active member answers for and forwards traffic sent to the virtual address."]
  ]),
  single("first-hop-redundancy", "first-hop-redundancy-s3", "What is the purpose of preemption in a first-hop redundancy protocol?", 0, [
    ["Allow a higher-priority router to reclaim the active role when it returns", "With preemption enabled, a returning higher-priority member can become active again."],
    ["Make every router active simultaneously", "A group coordinates an active role rather than making every member active."],
    ["Disable monitoring of the active router", "Preemption does not replace failure detection."],
    ["Change the clients' configured gateway address", "The virtual gateway address is intended to remain stable."]
  ]),
  single("first-hop-redundancy", "first-hop-redundancy-s4", "Why is gateway redundancy useful to hosts on a LAN?", 2, [
    ["It removes the need for an IP subnet mask", "Hosts still require normal IP configuration including a prefix or mask."],
    ["It encrypts all traffic sent to the gateway", "First-hop redundancy is an availability mechanism, not encryption."],
    ["It provides a gateway failover without reconfiguring each host", "The virtual IP stays the same when a different router takes over."],
    ["It guarantees that an upstream ISP never fails", "The protocol protects the local first hop, not failures throughout the WAN."]
  ]),
  multi("first-hop-redundancy", "first-hop-redundancy-m1", "Which two features are commonly associated with a first-hop redundancy group?", [0, 3], [
    ["A shared virtual IP address used by hosts", "The virtual address represents the resilient default gateway."],
    ["A requirement that clients use each router's physical IP in turn", "Clients can keep one virtual gateway address."],
    ["A mechanism that replaces the LAN's routing table", "FHRP provides gateway availability rather than replacing routing."],
    ["An active/standby role that can change after a failure", "A standby can assume forwarding responsibility if the active member fails."]
  ]),
  multi("first-hop-redundancy", "first-hop-redundancy-m2", "Which two considerations help make first-hop redundancy effective?", [1, 2], [
    ["Give every router in the group a different virtual gateway address", "Members of one group coordinate use of the same virtual gateway."],
    ["Configure hosts with the group's virtual gateway address", "Hosts must send off-subnet traffic to the redundant gateway address."],
    ["Ensure routers have connectivity to the LAN and appropriate upstream paths", "A router cannot provide useful failover if its required interfaces or upstream path are unavailable."],
    ["Configure the standby to discard all group control messages", "Members need control communication to track group state."]
  ]),
  ordering("first-hop-redundancy", "first-hop-redundancy-o1", "Order the basic failover sequence after the active first-hop router fails.", [
    ["The active router stops forwarding or group messages", "Failure or loss of group communication triggers detection."],
    ["The standby detects that the active role is unavailable", "The standby uses protocol timers or tracking to identify the failure."],
    ["The standby assumes the active role for the virtual gateway", "The group transitions responsibility to the available router."],
    ["Hosts continue sending to the same virtual gateway address", "Host configuration remains unchanged through the transition."]
  ]),
  simlet("first-hop-redundancy", "first-hop-redundancy-r1", "Choose the two accurate interpretations of this illustrative gateway group status.", `EdgeA# show standby brief
Interface  Grp  Pri  State   Virtual IP
Gi0/0      12   110  Active  192.168.12.1
EdgeB# show standby brief
Interface  Grp  Pri  State    Virtual IP
Gi0/0      12   100  Standby  192.168.12.1`, [0, 3], [
    ["Hosts can use 192.168.12.1 as their gateway", "Both routers report the same virtual IP for group 12."],
    ["EdgeB is currently forwarding as the active member", "EdgeB's displayed state is Standby."],
    ["The virtual address is EdgeA's physical interface address", "The output labels it as a shared virtual IP and does not identify it as the physical address."],
    ["EdgeA currently has the active role", "The status output explicitly shows EdgeA as Active."]
  ]),

  single("nat", "nat-s1", "What is the main effect of inside source NAT on an outbound packet?", 0, [
    ["It changes the source address to an outside-reachable address", "Inside source NAT translates the internal sender's address as traffic crosses the boundary."],
    ["It replaces the destination port with the router's console port", "NAT does not redirect traffic to a management console by default."],
    ["It encrypts the packet payload", "Address translation does not provide encryption."],
    ["It changes the packet's IP version from IPv4 to IPv6", "Ordinary NAT does not perform protocol-family translation."]
  ]),
  single("nat", "nat-s2", "Which NAT method allows multiple inside hosts to share one public IPv4 address by differentiating sessions?", 2, [
    ["Static one-to-one mapping only", "A one-to-one mapping assigns a distinct outside address per mapped host."],
    ["DNS forwarding", "DNS forwarding resolves names and does not translate source sessions."],
    ["Overload using transport-layer port numbers", "Port Address Translation multiplexes sessions through one address using port values."],
    ["A default route", "A route determines a path and does not translate addresses."]
  ]),
  single("nat", "nat-s3", "What is a typical use of static NAT?", 1, [
    ["Provide a unique temporary address from a shared pool to each new flow", "That describes dynamic allocation or overload behavior, not a fixed mapping."],
    ["Maintain a fixed inside-to-outside address mapping", "Static NAT provides a predictable mapping often used for an internally hosted service."],
    ["Select the fastest ISP path", "Path selection is a routing function, not NAT."],
    ["Supply subnet masks to clients", "DHCP commonly supplies masks; NAT translates addresses."]
  ]),
  single("nat", "nat-s4", "In NAT terminology, what is an inside local address?", 3, [
    ["The public address assigned to an external server", "That is an outside address, not the inside local identity."],
    ["The translated public source address seen by the Internet", "That is typically the inside global address."],
    ["The router's default route next hop", "A route next hop is not a NAT address role."],
    ["The address of an inside host as it is known within the inside network", "Inside local describes the host's original local-side address."]
  ]),
  multi("nat", "nat-m1", "Which two statements about NAT overload (PAT) are accurate?", [1, 3], [
    ["It requires one public address for every simultaneous connection", "PAT permits many sessions to share an address, subject to available mappings."],
    ["It can distinguish sessions using protocol and port information", "Transport identifiers allow multiple flows to use one translated address."],
    ["It replaces routing and makes a default route unnecessary", "NAT and routing serve different purposes; translated packets still require a path."],
    ["It commonly lets multiple private hosts share an outside IPv4 address", "This is a common use of overload."]
  ]),
  multi("nat", "nat-m2", "Which two checks are useful when diagnosing a failed NAT translation?", [0, 2], [
    ["Verify inside/outside interface roles and translation rules", "Incorrect roles or rules can prevent the intended address translation."],
    ["Change the OSPF router ID to the public address", "Router IDs do not configure NAT mappings."],
    ["Inspect the translation table while generating a test flow", "The table can show whether matching traffic creates a translation."],
    ["Disable IP forwarding on the gateway", "Disabling forwarding prevents routed traffic from crossing the gateway."]
  ]),
  ordering("nat", "nat-o1", "Order the basic path of an inside-originated packet through source NAT.", [
    ["An inside host sends a packet toward an external destination", "The packet begins with the host's inside local source address."],
    ["The gateway matches the packet to a NAT rule", "The rule determines whether and how source translation applies."],
    ["The gateway translates the source and forwards the packet", "The outside packet uses the mapped address and, for PAT, a session identifier."],
    ["Return traffic is matched to the translation and delivered inside", "The mapping lets the gateway reverse the translation toward the originating host."]
  ]),
  simlet("nat", "nat-r1", "Which two statements match the illustrative translation table?", `GW# show ip nat translations
Pro  Inside global     Inside local      Outside local  Outside global
tcp  198.51.100.7:4102 10.1.1.25:51500   203.0.113.8:443 203.0.113.8:443
icmp 198.51.100.7:9    10.1.1.30:9      192.0.2.20:0   192.0.2.20:0`, [0, 2], [
    ["Inside host 10.1.1.25 is represented externally as 198.51.100.7:4102 for this TCP mapping", "The row pairs that inside-local endpoint with the displayed inside-global endpoint."],
    ["The outside web server has been translated to 10.1.1.25", "The outside address remains 203.0.113.8 in this entry."],
    ["The table shows an ICMP translation associated with 10.1.1.30", "The second row identifies 10.1.1.30 as the inside local address."],
    ["The output proves that all inside hosts use unique public IPv4 addresses", "One sample mapping cannot establish that; the displayed rows even share one global address."]
  ]),

  single("ntp", "ntp-s1", "Why should network devices synchronize their clocks to a trusted NTP source?", 2, [
    ["NTP assigns interface IP addresses", "Address assignment is a DHCP function, not NTP."],
    ["NTP encrypts all routing updates", "NTP synchronizes time; it does not encrypt routing protocols."],
    ["Consistent timestamps make logs and event sequences easier to correlate", "Aligned clocks help operators compare events across multiple devices."],
    ["NTP selects the best route to each subnet", "Route selection is performed by the routing system."]
  ]),
  single("ntp", "ntp-s2", "A device reports that its clock is unsynchronized. Which first check is most relevant?", 0, [
    ["Confirm reachability to the configured NTP server and that a source is configured", "Without a reachable server and valid configuration, the device cannot synchronize."],
    ["Increase the interface MTU until the clock updates", "NTP synchronization does not ordinarily depend on increasing the MTU."],
    ["Clear the ARP table repeatedly", "Clearing ARP does not correct a missing or unreachable time source."],
    ["Change the device's OSPF cost", "OSPF cost has no bearing on clock synchronization."]
  ]),
  single("ntp", "ntp-s3", "What is the role of an NTP stratum value?", 3, [
    ["It reports a router's route metric", "NTP stratum is unrelated to routing metrics."],
    ["It identifies the VLAN of a time server", "VLAN identifiers are Layer 2 configuration values."],
    ["It is the UTC offset configured on a client", "Stratum describes hierarchy from the reference time source, not local time zone offset."],
    ["It indicates the source's position in the synchronization hierarchy", "Lower stratum values are generally closer to a reference clock."]
  ]),
  single("ntp", "ntp-s4", "Which transport protocol and port are conventionally used by NTP?", 1, [
    ["TCP port 123", "NTP conventionally uses UDP rather than TCP."],
    ["UDP port 123", "NTP normally exchanges time messages over UDP port 123."],
    ["UDP port 53", "UDP port 53 is commonly used for DNS queries."],
    ["TCP port 22", "TCP port 22 is commonly used for SSH."]
  ]),
  multi("ntp", "ntp-m1", "Which two practices improve reliable time synchronization across network devices?", [0, 3], [
    ["Configure devices to use a consistent, trusted time source", "A common reliable source keeps clocks aligned across the environment."],
    ["Set each device clock independently and never update it", "Independent clocks drift and are difficult to correlate."],
    ["Use the device's route metric as the clock offset", "Routing metrics do not set time offsets."],
    ["Ensure the NTP server is reachable through the network", "Time synchronization requires communication with a usable time source."]
  ]),
  multi("ntp", "ntp-m2", "Which two outcomes can result from unsynchronized device clocks?", [1, 2], [
    ["Automatic correction of incorrect subnet masks", "Clock synchronization does not manage addressing."],
    ["Log events may appear in a misleading order across devices", "Different clocks can distort the apparent timeline."],
    ["Certificate or authentication workflows that depend on time may fail", "Incorrect time can invalidate time-sensitive security checks."],
    ["The router begins advertising a default route", "Clock state does not cause default-route advertisement."]
  ]),
  ordering("ntp", "ntp-o1", "Order the basic steps for bringing a network device into time synchronization.", [
    ["Configure a trusted NTP server address", "The device first needs a defined time source."],
    ["Provide IP reachability from the device to that server", "NTP packets must be able to reach the server and return."],
    ["Allow the client to exchange NTP messages and evaluate the source", "The client polls and determines whether the source can be used."],
    ["Verify synchronization status and resulting clock time", "Confirm the device has selected a valid source and synchronized."]
  ]),
  simlet("ntp", "ntp-r1", "What two conclusions are supported by this illustrative status output?", `Router# show ntp status
Clock is synchronized, stratum 3, reference is 192.0.2.20
nominal freq is 250.0000 Hz, actual freq is 249.9980 Hz
Router# show ntp associations
*~192.0.2.20   stratum 2  reach 377  configured`, [0, 3], [
    ["The device reports that its clock is synchronized", "The first status line explicitly reports synchronization."],
    ["The router itself is a stratum-1 reference clock", "The output reports the router at stratum 3 and its selected source at stratum 2."],
    ["The NTP source is unreachable", "A reach value of 377 indicates successful recent polling in this illustrative output."],
    ["192.0.2.20 is the selected reference source", "The status names it as the reference and the association marks it selected."]
  ]),

  single("dhcp-dns", "dhcp-dns-s1", "Which DHCP message does a client typically send first when it has no address and seeks a lease?", 1, [
    ["DHCPACK", "The server sends an acknowledgment after a lease offer has been accepted."],
    ["DHCPDISCOVER", "A client broadcasts discovery to locate available DHCP servers."],
    ["DHCPOFFER", "A server sends an offer in response to client discovery."],
    ["DHCPRELEASE", "A release message returns a lease rather than requesting one."]
  ]),
  single("dhcp-dns", "dhcp-dns-s2", "A client can ping a server by IP address but cannot open it by name. Which service should be investigated first?", 3, [
    ["NTP", "NTP provides clock synchronization rather than hostname resolution."],
    ["OSPF", "OSPF exchanges routing information, and IP reachability is already demonstrated."],
    ["PAT", "PAT translates addresses and does not resolve names."],
    ["DNS", "DNS maps names to records such as IP addresses."]
  ]),
  single("dhcp-dns", "dhcp-dns-s3", "Which DHCP option commonly tells an IPv4 client its default gateway?", 0, [
    ["Router option (option 3)", "DHCP option 3 supplies the default router for the client subnet."],
    ["DNS server option (option 6)", "Option 6 supplies DNS resolvers, not the default gateway."],
    ["Domain name option (option 15)", "Option 15 supplies a domain name suffix."],
    ["Lease time option (option 51)", "Option 51 specifies the lease duration."]
  ]),
  single("dhcp-dns", "dhcp-dns-s4", "What does a DNS A record contain?", 2, [
    ["An IPv6 address", "An IPv6 address is represented by an AAAA record."],
    ["A mail exchanger preference", "Mail routing is represented by an MX record."],
    ["An IPv4 address associated with a name", "An A record maps a DNS name to an IPv4 address."],
    ["A DHCP lease duration", "Lease duration is DHCP configuration, not DNS record data."]
  ]),
  multi("dhcp-dns", "dhcp-dns-m1", "Which two items can a DHCP server provide to a client as part of IPv4 configuration?", [0, 2], [
    ["An IPv4 address and subnet mask", "A DHCP lease commonly includes the address and subnet mask."],
    ["An OSPF neighbor state", "Neighbor state is learned by OSPF, not delivered as a client lease parameter."],
    ["A DNS resolver address", "A DHCP option can specify one or more DNS servers."],
    ["A guaranteed public NAT mapping", "DHCP does not guarantee a NAT translation on the gateway."]
  ]),
  multi("dhcp-dns", "dhcp-dns-m2", "Which two statements distinguish DHCP from DNS?", [1, 3], [
    ["DNS leases addresses to hosts", "Address leasing is DHCP's role; DNS resolves names."],
    ["DHCP can provide clients with network configuration", "A DHCP lease can include address, mask, gateway, and DNS settings."],
    ["DHCP translates domain names into IP addresses", "Name resolution is performed by DNS."],
    ["DNS can return records used to locate services or addresses", "DNS records can provide addresses and service discovery information."]
  ]),
  ordering("dhcp-dns", "dhcp-dns-o1", "Order the common initial DHCPv4 address assignment exchange.", [
    ["Client broadcasts DHCPDISCOVER", "The client seeks one or more DHCP servers."],
    ["Server responds with DHCPOFFER", "A server proposes address and lease parameters."],
    ["Client broadcasts DHCPREQUEST for a chosen offer", "The client indicates which offered lease it wants."],
    ["Server sends DHCPACK to confirm the lease", "The acknowledgment finalizes the client's lease."]
  ]),
  simlet("dhcp-dns", "dhcp-dns-r1", "Select the two accurate interpretations of this illustrative client configuration.", `PC> ipconfig
IPv4 Address . . . . . : 10.30.4.25
Subnet Mask . . . . . : 255.255.255.0
Default Gateway . . . : 10.30.4.1
DNS Servers . . . . . : 10.30.4.53
PC> nslookup portal.example.test
Server: 10.30.4.53
Address: 10.30.4.53
Name: portal.example.test
Address: 10.30.4.80`, [1, 2], [
    ["The default gateway is 10.30.4.53", "That address is shown as the DNS server, not the gateway."],
    ["The client is configured to query DNS at 10.30.4.53", "The configuration lists that address under DNS Servers."],
    ["The lookup returned 10.30.4.80 for the requested name", "The response maps the queried name to that IPv4 address."],
    ["The output shows the DHCP server address", "No DHCP server identifier appears in this client output."]
  ]),

  single("monitoring", "monitoring-s1", "Which protocol is commonly used to collect management and performance counters from network devices?", 2, [
    ["NTP", "NTP synchronizes clocks rather than collecting management counters."],
    ["TFTP", "TFTP transfers files and is not the standard network monitoring protocol."],
    ["SNMP", "SNMP supports polling and notifications for device management information."],
    ["OSPF", "OSPF is a routing protocol, not a general monitoring protocol."]
  ]),
  single("monitoring", "monitoring-s2", "What is a syslog severity value used to communicate?", 0, [
    ["The relative urgency or seriousness of a log message", "Severity categorizes how critical an event is."],
    ["The number of bytes in an Ethernet frame", "Frame size is unrelated to log severity."],
    ["The router's OSPF area", "Area identifiers are separate routing configuration."],
    ["The IP address assigned by DHCP", "DHCP addressing is unrelated to syslog priority."]
  ]),
  single("monitoring", "monitoring-s3", "Which SNMP mechanism lets an agent send an event notification without waiting for a poll?", 1, [
    ["A route update", "A route update is sent by a routing protocol, not as an SNMP notification."],
    ["A trap or inform notification", "An agent can proactively send a trap or an acknowledged inform to a manager."],
    ["A DNS query", "DNS queries resolve names and are not SNMP event notifications."],
    ["A DHCP offer", "A DHCP offer proposes client configuration."]
  ]),
  single("monitoring", "monitoring-s4", "Why configure a network device to send syslog messages to a remote collector?", 3, [
    ["To make the collector forward packets between VLANs", "Syslog transports event messages and does not make the collector a router."],
    ["To replace interface counters", "Syslog complements rather than replaces counters and monitoring."],
    ["To make local timestamps accurate without a time source", "Remote logging does not itself synchronize clocks."],
    ["To retain and correlate events outside the device", "A central collector can aggregate messages and preserve them beyond local log buffers."]
  ]),
  multi("monitoring", "monitoring-m1", "Which two statements about SNMP monitoring are correct?", [0, 3], [
    ["A manager can poll an agent for managed values", "Polling retrieves values from the agent's management information."],
    ["SNMP replaces the device's routing protocol", "SNMP monitors or manages devices; it does not replace routing."],
    ["A trap always requires an explicit acknowledgment", "Traps are generally unacknowledged; informs are acknowledged."],
    ["An agent can send a notification when an event occurs", "SNMP notifications can alert a manager without a poll."]
  ]),
  multi("monitoring", "monitoring-m2", "Which two practices strengthen the usefulness of network event logs?", [1, 2], [
    ["Use unsynchronized local clocks on every device", "Clock drift undermines cross-device event correlation."],
    ["Synchronize device time with a trusted source", "Consistent timestamps establish a more reliable timeline."],
    ["Send important logs to a centralized collector", "Central collection aids retention, search, and correlation."],
    ["Set all messages to the least severe value", "Flattening severity removes useful prioritization."]
  ]),
  ordering("monitoring", "monitoring-o1", "Order a basic response when investigating a reported interface outage using centralized monitoring.", [
    ["Check the alert time and affected device/interface", "Establish which resource and timeframe are involved."],
    ["Correlate syslog events and monitoring data around that time", "Events and counters can reveal a link transition or error."],
    ["Compare related interface status and error counters", "Validate whether the reported symptom is present on the device."],
    ["Record the likely cause and recovery evidence", "Document the finding and confirm service status after corrective action."]
  ]),
  simlet("monitoring", "monitoring-r1", "Which two interpretations of this illustrative output are correct?", `Collector view:
10:12:04.120  access-sw1  %LINK-3-UPDOWN: Interface Gi1/0/8, changed state to down
10:12:06.402  access-sw1  %LINEPROTO-5-UPDOWN: Line protocol on Gi1/0/8, changed state to down
SNMP poll 10:12:10: Gi1/0/8 ifOperStatus=down, ifInErrors=0`, [0, 3], [
    ["The syslog indicates that Gi1/0/8 transitioned down", "The first two messages explicitly show interface and line protocol down events."],
    ["The output proves a cable was physically cut", "A down event can have several causes; the output does not prove a specific physical failure."],
    ["The SNMP poll says the interface is up", "ifOperStatus=down indicates the operational state is down."],
    ["The sampled input error counter is zero", "The poll reports ifInErrors=0 at that time."]
  ]),

  single("qos", "qos-s1", "Which QoS action assigns a traffic class or value such as a DSCP marking?", 0, [
    ["Marking", "Marking writes a classification value into packet or frame metadata."],
    ["Policing", "Policing enforces a rate by dropping or remarking excess traffic."],
    ["Shaping", "Shaping buffers and delays traffic to conform to a rate."],
    ["Routing", "Routing selects a path rather than assigning a QoS marking."]
  ]),
  single("qos", "qos-s2", "What is the main effect of traffic shaping when traffic exceeds a configured rate?", 2, [
    ["Immediately discard every packet in the flow", "Immediate discard is more characteristic of policing than shaping."],
    ["Increase the flow's routing metric", "Shaping does not modify routing metrics."],
    ["Buffer excess traffic and transmit it later when capacity is available", "Shaping smooths a burst by queuing excess traffic within limits."],
    ["Encrypt the payload before forwarding", "Shaping is not a security or encryption function."]
  ]),
  single("qos", "qos-s3", "Why classify traffic before applying different QoS treatment?", 3, [
    ["To choose an IP address for each application", "Classification does not assign addressing."],
    ["To determine which routing protocol to enable", "QoS classification is not protocol selection."],
    ["To ensure every packet receives the same priority", "Different treatment requires traffic to be distinguished."],
    ["To identify traffic that should receive a particular policy", "Classification groups packets so later marking, queuing, or rate actions can apply."]
  ]),
  single("qos", "qos-s4", "Which queueing outcome is typically desired for latency-sensitive voice during congestion?", 1, [
    ["Hold voice behind bulk transfers until the link is idle", "This would add unacceptable delay to latency-sensitive traffic."],
    ["Give voice an appropriate low-latency service while controlling its rate", "Priority treatment reduces delay while rate controls prevent starvation."],
    ["Drop all voice packets as soon as congestion begins", "Dropping all voice defeats the goal of QoS."],
    ["Rewrite voice packets as DNS requests", "Changing application payload identity is not a QoS action."]
  ]),
  multi("qos", "qos-m1", "Which two are common QoS building blocks?", [0, 2], [
    ["Classification and marking", "Traffic can be identified and labeled for consistent treatment."],
    ["DNS recursion and caching", "These are name-service functions, not QoS building blocks."],
    ["Queuing and scheduling", "Queues and schedulers determine how packets are buffered and transmitted."],
    ["OSPF adjacency election", "OSPF adjacency behavior is independent of QoS queuing."]
  ]),
  multi("qos", "qos-m2", "Which two statements about congestion controls are accurate?", [1, 3], [
    ["Shaping normally discards all excess traffic immediately", "Shaping generally buffers excess traffic before transmitting it later."],
    ["Policing can drop or remark traffic that exceeds a rate", "A policer enforces a rate without the same buffering behavior as shaping."],
    ["Classification itself guarantees additional bandwidth", "Classification identifies traffic but does not create link capacity."],
    ["Queuing policies decide how competing packets are serviced", "Scheduling determines which queue is served and in what order."]
  ]),
  ordering("qos", "qos-o1", "Order a conceptual QoS policy from identifying packets through delivering differentiated service.", [
    ["Classify packets using trusted attributes", "Classification assigns traffic to a policy class."],
    ["Mark or associate the selected class with a treatment", "Marking carries the class decision to later handling."],
    ["Apply rate and queue policies at the congestion point", "Policing, shaping, and queue selection govern behavior under load."],
    ["Schedule packets onto the outgoing link", "The scheduler sends packets according to the configured service policy."]
  ]),
  simlet("qos", "qos-r1", "Which two observations follow from this illustrative policy and counters?", `Router# show policy-map interface Gi0/1
Class VOICE
  match dscp ef
  priority level 1
  offered rate 120 kbps
Class BULK
  match access-group BULK-ACL
  shape average 2000000
  current rate 1750000 bps`, [0, 2], [
    ["Traffic marked EF is matched into the VOICE class", "The policy explicitly matches DSCP EF under VOICE."],
    ["The BULK class is currently transmitting above its configured average", "The displayed current rate is below the 2 Mbps shaping target."],
    ["The BULK class has a 2 Mbps average shaping target", "The configured shape average is 2,000,000 bits per second."],
    ["The output shows that all voice packets are encrypted", "QoS class and priority data do not establish encryption."]
  ]),

  single("ssh", "ssh-s1", "What is a primary advantage of using SSH instead of Telnet for device administration?", 3, [
    ["SSH assigns management IP addresses automatically", "SSH is a remote access protocol, not address assignment."],
    ["SSH removes the need for user authentication", "SSH supports authentication rather than eliminating it."],
    ["SSH uses unencrypted text to simplify troubleshooting", "SSH encrypts the management session rather than exposing plaintext."],
    ["SSH protects the remote command-line session with encryption", "Encryption helps protect credentials and session contents in transit."]
  ]),
  single("ssh", "ssh-s2", "Which transport protocol and port are the conventional default for SSH?", 0, [
    ["TCP port 22", "SSH conventionally establishes its encrypted session over TCP port 22."],
    ["UDP port 22", "SSH uses TCP, not UDP, as its conventional transport."],
    ["TCP port 23", "TCP port 23 is commonly associated with Telnet."],
    ["UDP port 161", "UDP port 161 is commonly used for SNMP polling."]
  ]),
  single("ssh", "ssh-s3", "What is the purpose of an SSH host key?", 2, [
    ["It assigns a VLAN to the administrator", "Host keys are cryptographic identity material, not VLAN settings."],
    ["It provides a DNS record for the router", "DNS records are configured separately."],
    ["It helps the client authenticate the server's identity", "The host key lets a client detect an unexpected server identity."],
    ["It is the router's default gateway", "A host key is not an IP routing parameter."]
  ]),
  single("ssh", "ssh-s4", "Which management-plane practice best limits who can open SSH sessions to a router?", 1, [
    ["Allow SSH from every source and rely on obscurity", "Broad unrestricted access unnecessarily increases exposure."],
    ["Restrict SSH using an access policy for approved management sources", "Limiting reachable management sources reduces attack surface."],
    ["Disable account authentication", "SSH administration should require appropriate authentication."],
    ["Permit Telnet as a fallback from the Internet", "Telnet exposes management traffic and does not strengthen access control."]
  ]),
  multi("ssh", "ssh-m1", "Which two measures help secure administrative SSH access?", [0, 3], [
    ["Use strong authentication and protect private credentials", "Strong, controlled credentials reduce unauthorized access risk."],
    ["Share one administrator password publicly", "Publicly shared credentials defeat accountability and access control."],
    ["Enable remote login from every interface without restrictions", "Unrestricted management exposure is not a secure practice."],
    ["Limit management access to trusted sources where practical", "Source restrictions narrow the set of systems able to attempt access."]
  ]),
  multi("ssh", "ssh-m2", "Which two statements about SSH are correct?", [1, 2], [
    ["SSH provides automatic DHCP service to clients", "DHCP, not SSH, provides client configuration."],
    ["SSH encrypts data exchanged in the remote management session", "SSH is designed to protect session contents in transit."],
    ["SSH can support remote command-line administration", "A common use is secure remote CLI access to network devices."],
    ["SSH is a routing protocol that advertises prefixes", "SSH does not exchange routing information."]
  ]),
  ordering("ssh", "ssh-o1", "Order a secure SSH management session from connection attempt to authenticated CLI access.", [
    ["Administrator connects to the device's SSH service", "The client initiates a TCP connection to the reachable management endpoint."],
    ["Client and server negotiate cryptographic algorithms", "They agree on suitable session protection parameters."],
    ["Client verifies the server identity and both sides authenticate as required", "Host identity checking and user authentication establish trusted access."],
    ["Encrypted session carries the administrator's CLI interaction", "Commands and responses travel inside the protected session."]
  ]),
  simlet("ssh", "ssh-r1", "Which two conclusions are supported by this illustrative management output?", `Router# show ip ssh
SSH Enabled - version 2.0
Authentication timeout: 60 secs; Authentication retries: 3
Router# show users
Line       User       Host             Idle
vty 0      netops     192.0.2.50       00:00:12`, [0, 3], [
    ["The device reports SSH version 2 enabled", "The output explicitly states SSH Enabled - version 2.0."],
    ["The active remote session is using Telnet", "The output is an SSH status command and does not identify Telnet."],
    ["The administrator's host is 192.0.2.1", "The listed host address is 192.0.2.50."],
    ["A user named netops is connected from 192.0.2.50", "The session table shows that username and host on vty 0."]
  ]),

  single("file-transfer", "file-transfer-s1", "Which protocol is commonly used to transfer a device image or configuration file without providing built-in encryption?", 2, [
    ["SSH", "SSH is encrypted remote access and can carry secure file transfer methods, but the question asks for the commonly used unencrypted file service."],
    ["NTP", "NTP synchronizes clocks and does not transfer configuration files."],
    ["TFTP", "TFTP is a simple file-transfer service commonly used for network-device files and has no built-in encryption."],
    ["OSPF", "OSPF exchanges routing information, not arbitrary files."]
  ]),
  single("file-transfer", "file-transfer-s2", "Before replacing a router image, what is a prudent file-transfer preparation step?", 0, [
    ["Verify the file, available storage, and a recoverable backup or rollback plan", "Validation and recovery planning reduce the risk of an unusable device after an image change."],
    ["Delete all backups to increase flash space", "Removing every recovery copy can make a failed upgrade harder to recover from."],
    ["Assume a successful copy guarantees a valid boot image", "A completed transfer alone does not verify integrity or boot compatibility."],
    ["Disable all routing protocols permanently", "File copying does not require permanent removal of routing configuration."]
  ]),
  single("file-transfer", "file-transfer-s3", "Which protocol provides encrypted file transfer over an SSH session?", 1, [
    ["TFTP", "TFTP does not provide SSH-based encryption."],
    ["SFTP", "SFTP transfers files through the secure SSH transport."],
    ["SNMP", "SNMP monitors and manages device information rather than transferring files this way."],
    ["DNS", "DNS resolves names and does not transfer device files."]
  ]),
  single("file-transfer", "file-transfer-s4", "A device reports that a copied file is smaller than the expected image. What should an administrator do before using it?", 3, [
    ["Boot from it immediately to test whether it works", "An incomplete image could leave the device unable to boot."],
    ["Rename it to match the expected version", "Renaming does not restore missing file data."],
    ["Delete the known-good running configuration", "Removing a recovery configuration does not repair the file."],
    ["Recheck the transfer and verify file size or checksum against a trusted value", "Transfer validation can detect truncation or corruption before deployment."]
  ]),
  multi("file-transfer", "file-transfer-m1", "Which two details should be checked before copying a configuration or image to a device?", [0, 2], [
    ["Destination path and available storage", "The target location must exist and have sufficient capacity."],
    ["The device's DNS search suffix only", "A suffix alone does not confirm file destination or capacity."],
    ["Transfer server reachability and correct file identity", "The device must reach the intended server and use the correct file."],
    ["That the file name contains the word backup", "A name alone does not prove that the file is correct or recoverable."]
  ]),
  multi("file-transfer", "file-transfer-m2", "Which two statements about device file transfer are accurate?", [1, 3], [
    ["A successful transfer always proves that an image will boot", "Transfer success does not establish integrity, compatibility, or bootability."],
    ["TFTP is lightweight but does not encrypt the transferred content", "TFTP is simple and should be used only with suitable network protections."],
    ["NTP is the preferred protocol for copying configuration files", "NTP exchanges time information, not file content."],
    ["A checksum comparison can help detect file corruption", "Matching a trusted checksum provides evidence that file contents arrived intact."]
  ]),
  ordering("file-transfer", "file-transfer-o1", "Order a cautious network-device image transfer and validation workflow.", [
    ["Confirm the approved image and target storage path", "Identify the intended file and destination before transfer."],
    ["Check server reachability, credentials, and available storage", "Confirm the transfer can proceed and there is room for the file."],
    ["Copy the file to the device", "Transfer the image to the selected storage location."],
    ["Verify size or checksum and retain a recovery plan before activation", "Validate the copy and prepare rollback before using the image."]
  ]),
  simlet("file-transfer", "file-transfer-r1", "Which two conclusions are supported by this illustrative transfer and verification output?", `Router# copy scp://ops@192.0.2.40/images/rtr.bin flash:rtr.bin
Destination filename [rtr.bin]?
Copied 18432000 bytes in 12.4 secs
Router# verify /md5 flash:rtr.bin
MD5 hash of flash:rtr.bin: 7b9d...e412
Expected: 7b9d...e412`, [0, 2], [
    ["The copy command reports that 18,432,000 bytes were transferred", "The illustrative output states the transfer byte count."],
    ["The output proves the device has booted from the new image", "The output only reports copying and verification; it does not show a boot."],
    ["The displayed checksum matches the expected value", "Both abbreviated values shown are identical."],
    ["The SCP server address is 192.0.2.14", "The command names 192.0.2.40 as the server."]
  ])
];
