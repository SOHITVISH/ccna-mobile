import type { AssessmentOption, AssessmentQuestion } from "../assessmentTypes";

type OptionTuple = [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption];
type OptionRow = [string, string, string];
type OptionRows = [OptionRow, OptionRow, OptionRow, OptionRow];

const option = ([id, text, explanation]: OptionRow): AssessmentOption => ({ id, text, explanation });
const options = (rows: OptionRows): OptionTuple => [
  option(rows[0]),
  option(rows[1]),
  option(rows[2]),
  option(rows[3]),
];

const single = (id: string, topicId: string, prompt: string, answer: string, rows: OptionRows): AssessmentQuestion => ({
  id, topicId, prompt, type: "single", options: options(rows), answerIds: [answer],
});
const multi = (id: string, topicId: string, prompt: string, answers: [string, string], rows: OptionRows): AssessmentQuestion => ({
  id, topicId, prompt, type: "multi-select", options: options(rows), answerIds: answers,
});
const ordering = (id: string, topicId: string, prompt: string, order: [string, string, string, string], rows: OptionRows): AssessmentQuestion => ({
  id, topicId, prompt, type: "ordering", items: options(rows), correctOrder: order,
});
const simlet = (id: string, topicId: string, prompt: string, output: string, answers: [string, string], rows: OptionRows): AssessmentQuestion => ({
  id, topicId, prompt, type: "simlet", output, options: options(rows), answerIds: answers,
});

export const ccnaFoundationsQuestions: AssessmentQuestion[] = [
  // Network devices and roles
  single("nf-devices-s1", "network-devices", "Which device makes a Layer 3 forwarding decision between two IP subnets?", "router", [
    ["router", "Router", "Correct: it uses IP routes to forward packets between networks."],
    ["switch", "Layer 2 access switch", "A Layer 2 switch forwards frames within a VLAN using MAC addresses."],
    ["ap", "Standalone access point", "An access point bridges wireless clients onto a LAN; it does not normally route between subnets."],
    ["hub", "Ethernet hub", "A hub repeats signals to its ports and has no IP routing function."],
  ]),
  single("nf-devices-s2", "network-devices", "A switch knows the destination MAC address on one of its ports. What does it normally do with the frame?", "forward", [
    ["forward", "Send it out the learned destination port", "Correct: the MAC table maps the destination to the egress port."],
    ["route", "Look up the destination IP in a routing table", "That is a router's Layer 3 forwarding decision, not ordinary Layer 2 switching."],
    ["flood", "Copy it to every port, including the ingress port", "Known unicast traffic is sent only to its destination port, not flooded."],
    ["drop", "Discard it because the destination is known", "Learning a destination enables forwarding rather than requiring a drop."],
  ]),
  single("nf-devices-s3", "network-devices", "Which device is primarily responsible for providing radio connectivity to Wi-Fi clients and bridging them to Ethernet?", "ap", [
    ["ap", "Wireless access point", "Correct: the AP provides the WLAN radio interface and bridges client traffic to the wired LAN."],
    ["router", "WAN edge router", "A router may provide routing and other services, but radio access is the AP's role."],
    ["switch", "Unmanaged Ethernet switch", "A basic switch connects wired Ethernet devices and has no client radio."],
    ["firewall", "Stateful firewall", "A firewall enforces traffic policy; it does not inherently provide Wi-Fi access."],
  ]),
  single("nf-devices-s4", "network-devices", "Which device is the most appropriate default gateway for hosts on a subnet that must reach another subnet?", "gateway", [
    ["gateway", "A router interface in the hosts' subnet", "Correct: hosts send off-subnet packets to a reachable Layer 3 gateway."],
    ["dns", "A DNS resolver in the same subnet", "DNS resolves names; it is not the next hop for arbitrary off-subnet traffic."],
    ["ap", "An access point management address", "An AP's management address does not automatically forward client packets between subnets."],
    ["server", "A file server in a different subnet", "A remote server cannot serve as the local next hop without routing configuration."],
  ]),
  multi("nf-devices-m1", "network-devices", "Which two statements correctly describe common LAN device roles?", ["switchlearn", "routerroute"], [
    ["switchlearn", "A switch learns source MAC addresses on ingress ports.", "Correct: source learning builds the MAC address table."],
    ["routerroute", "A router forwards packets between networks using Layer 3 information.", "Correct: inter-network forwarding is a core router function."],
    ["hubfilter", "A hub filters frames by destination MAC address.", "A hub repeats signals rather than examining MAC addresses."],
    ["apassign", "Every access point must assign IP addresses to wireless clients.", "Address assignment is commonly performed by DHCP, not inherently by the AP."],
  ]),
  multi("nf-devices-m2", "network-devices", "A small office needs wired port expansion and Wi-Fi, while retaining a separate router for its internet link. Which two devices meet the expansion needs?", ["switch", "ap"], [
    ["switch", "Ethernet switch", "Correct: it adds wired LAN ports and forwards frames within the LAN."],
    ["ap", "Wireless access point", "Correct: it adds radio access for wireless clients and bridges them onto the LAN."],
    ["repeater", "Layer 1 repeater", "A repeater extends a physical signal but does not provide switched port expansion or WLAN access."],
    ["dns", "DNS server", "A DNS server resolves names; it does not add wired ports or Wi-Fi coverage."],
  ]),
  ordering("nf-devices-o1", "network-devices", "Put the forwarding decisions in order for a PC sending an off-subnet packet through a local switch and router.", ["frame", "switch", "gateway", "route"], [
    ["frame", "PC encapsulates the packet in a frame addressed to its gateway MAC.", "First: the host uses the gateway as the Layer 2 destination for off-subnet traffic."],
    ["switch", "Switch forwards the frame toward the gateway port.", "Second: the switch uses the destination MAC table to deliver the frame."],
    ["gateway", "Router receives the frame and examines the IP destination.", "Third: after decapsulation, the router makes a Layer 3 decision."],
    ["route", "Router selects an outgoing interface or next hop from its routes.", "Fourth: the route determines where the packet continues."],
  ]),
  simlet("nf-devices-r1", "network-devices", "Read this illustrative switch output. Which two conclusions follow from the learned entries?", "Switch# show mac address-table dynamic\nVlan    Mac Address       Type        Ports\n10      00aa.0011.0022    DYNAMIC     Gi1/0/3\n20      00bb.0033.0044    DYNAMIC     Gi1/0/8", ["vlan10", "vlan20"], [
    ["vlan10", "The listed MAC is learned in VLAN 10 on Gi1/0/3.", "Correct: both the VLAN and learned port are shown in that row."],
    ["vlan20", "The other listed MAC is learned in VLAN 20 on Gi1/0/8.", "Correct: its row identifies VLAN 20 and Gi1/0/8."],
    ["routing", "The switch has an IP route to VLAN 20 through Gi1/0/8.", "The output is a Layer 2 MAC table, not a routing table."],
    ["wireless", "The entry proves the MAC belongs to a wireless client.", "A MAC table shows where a source was learned, not the endpoint's access technology."],
  ]),

  // Network architectures and topologies
  single("nf-topology-s1", "topologies", "In a star topology with a central switch, what is the usual impact of one workstation's access cable failing?", "one", [
    ["one", "That workstation loses its link; other spokes can remain connected.", "Correct: each endpoint has a separate link to the central point."],
    ["all", "Every workstation loses connectivity immediately.", "A single spoke failure does not normally interrupt the other independent links."],
    ["loop", "The failure creates a Layer 2 forwarding loop.", "A broken spoke removes a path; it does not by itself form a loop."],
    ["route", "The switch automatically routes around the failed workstation.", "A workstation access cable is not an alternate routed path."],
  ]),
  single("nf-topology-s2", "topologies", "Which architecture connects each leaf switch to every spine switch, with traffic between leaves traversing a spine?", "spineleaf", [
    ["spineleaf", "Spine-and-leaf", "Correct: leaf-to-spine connectivity provides predictable paths across the fabric."],
    ["ring", "Ring", "A ring connects devices in a cycle rather than using leaf and spine roles."],
    ["bus", "Bus", "A bus shares one backbone segment; it is not the described fabric."],
    ["star", "Single-tier star", "A single central star has one central connection tier, not separate leaf and spine tiers."],
  ]),
  single("nf-topology-s3", "topologies", "A campus design separates access, distribution, and core functions. What is this commonly called?", "three", [
    ["three", "Three-tier hierarchical design", "Correct: access, distribution, and core are its three functional layers."],
    ["mesh", "Full mesh", "A mesh describes interconnection density, not these three hierarchical roles."],
    ["soho", "SOHO topology", "SOHO describes a small-office/home-office environment, not the campus hierarchy."],
    ["point", "Point-to-point topology", "Point-to-point describes a link between two endpoints, not a three-layer campus."],
  ]),
  single("nf-topology-s4", "topologies", "Which property is most characteristic of a full mesh among n nodes?", "paths", [
    ["paths", "Each node has a direct link to every other node.", "Correct: full mesh provides direct pairwise connectivity, at high link cost."],
    ["central", "All nodes connect only through one central switch.", "That describes a star, not a full mesh."],
    ["single", "All devices share one half-duplex backbone cable.", "That resembles a bus topology."],
    ["layers", "Devices are divided specifically into access and distribution layers.", "That is a hierarchical design rather than full mesh connectivity."],
  ]),
  multi("nf-topology-m1", "topologies", "Which two statements about network topologies are accurate?", ["star", "mesh"], [
    ["star", "A star's central device can be a single point of failure for attached links.", "Correct: failure of the central device can affect all spokes."],
    ["mesh", "A mesh can provide alternate paths, usually at the cost of more links.", "Correct: redundant connectivity improves path availability but increases cabling/port needs."],
    ["ring", "A bus topology requires a central switch for every endpoint.", "A bus uses a shared backbone rather than a central switch."],
    ["leaf", "A spine-and-leaf fabric uses only one link between any two endpoints.", "Traffic between leaves generally traverses a spine; it is not necessarily one direct endpoint link."],
  ]),
  multi("nf-topology-m2", "topologies", "Which two are reasonable descriptions of common enterprise design patterns?", ["two", "wan"], [
    ["two", "A two-tier campus often combines distribution and core functions.", "Correct: collapsed-core designs merge those roles."],
    ["wan", "A WAN interconnects sites across a larger geographic area.", "Correct: WANs provide connectivity between geographically separated networks."],
    ["soho", "SOHO always requires separate core, distribution, and access switches.", "A SOHO design is usually much simpler and does not require that hierarchy."],
    ["ring", "A ring inherently guarantees continued service after any two link failures.", "Ring resilience depends on design and protection mechanisms; this is not guaranteed."],
  ]),
  ordering("nf-topology-o1", "topologies", "Order these hierarchical campus layers from user-facing edge toward the backbone.", ["access", "distribution", "core", "wan"], [
    ["access", "Access layer", "First: endpoints and access switches attach at the network edge."],
    ["distribution", "Distribution layer", "Second: this layer aggregates access and commonly applies policy."],
    ["core", "Core layer", "Third: the core provides high-speed campus interconnection."],
    ["wan", "WAN edge beyond the campus core", "Last: the WAN edge connects the campus to external sites or services."],
  ]),
  simlet("nf-topology-r1", "topologies", "The following is an illustrative cabling inventory. Which two observations fit a spine-and-leaf design?", "leaf01 Gi1/0/49 -> spine01 Eth1/1\nleaf01 Gi1/0/50 -> spine02 Eth1/1\nleaf02 Gi1/0/49 -> spine01 Eth1/2\nleaf02 Gi1/0/50 -> spine02 Eth1/2", ["dual", "cross"], [
    ["dual", "Each shown leaf has uplinks to two spine switches.", "Correct: the two distinct spine neighbors provide multiple fabric paths."],
    ["cross", "Both leaves connect to the same set of spines.", "Correct: this is the characteristic leaf-to-spine pattern shown."],
    ["ring", "The inventory shows a single ring where each leaf has two leaf neighbors.", "The listed uplinks terminate on spines, not neighboring leaves in a ring."],
    ["single", "Leaf02 has no alternate upstream path.", "Leaf02 has links to both spine01 and spine02."],
  ]),

  // Interfaces, media, and cabling
  single("nf-cabling-s1", "cabling", "Which media is generally the better choice for a building-to-building Ethernet link that exceeds copper Ethernet reach?", "fiber", [
    ["fiber", "Optical fiber", "Correct: fiber supports longer distances and is resistant to electromagnetic interference."],
    ["copper", "Unshielded twisted-pair copper", "Ethernet copper runs have distance limits and are not the usual choice beyond them."],
    ["console", "Serial console cable", "A console cable is for device management, not an Ethernet data uplink."],
    ["coax", "Television coaxial cable", "Coax is not the standard medium for a conventional Ethernet building uplink."],
  ]),
  single("nf-cabling-s2", "cabling", "What should be matched when selecting a transceiver for a fiber link?", "both", [
    ["both", "Fiber type and optical wavelength/reach supported at both ends", "Correct: compatible optics and fiber determine whether the link can operate reliably."],
    ["color", "Only the jacket color of the fiber", "Jacket color alone does not establish optical compatibility."],
    ["speed", "Only the switch's management IP address", "The management address has no bearing on physical optical compatibility."],
    ["vendor", "Only the connector's brand name", "Connector form and optical specifications matter; brand alone is not enough."],
  ]),
  single("nf-cabling-s3", "cabling", "Which connector type is commonly used for a modern duplex Ethernet optical transceiver?", "lc", [
    ["lc", "LC", "Correct: LC is a small-form-factor connector widely used on transceivers."],
    ["rj", "RJ-45", "RJ-45 is the familiar twisted-pair copper connector, not a fiber connector."],
    ["db9", "DB-9", "DB-9 is associated with serial connections, not optical Ethernet."],
    ["f", "F-type", "F-type is commonly used with coaxial services, not duplex fiber transceivers."],
  ]),
  single("nf-cabling-s4", "cabling", "A patch cable connects two devices with compatible auto-MDI-X Ethernet ports. Which cable type is typically suitable?", "straight", [
    ["straight", "Straight-through twisted pair", "Correct: modern auto-MDI-X ports can adapt to the pair arrangement."],
    ["console", "Rollover console cable", "A rollover cable is for console access, not Ethernet data connectivity."],
    ["serial", "Null-modem serial cable", "This is not a copper Ethernet patch cable."],
    ["fiber", "Single-mode fiber patch lead", "This does not connect copper RJ-45 interfaces."],
  ]),
  multi("nf-cabling-m1", "cabling", "Which two factors should be checked before choosing an Ethernet physical medium?", ["distance", "environment"], [
    ["distance", "Required link distance", "Correct: each medium and optic has a supported reach."],
    ["environment", "Electrical interference and installation environment", "Correct: fiber immunity and copper shielding may matter in noisy areas."],
    ["hostname", "The remote device's hostname length", "Hostname length does not determine the physical medium."],
    ["dns", "The DNS record TTL", "DNS configuration does not affect cable or optic selection."],
  ]),
  multi("nf-cabling-m2", "cabling", "Which two descriptions correctly distinguish common Ethernet media?", ["twisted", "optical"], [
    ["twisted", "Twisted-pair copper carries electrical signals over balanced pairs.", "Correct: Ethernet copper PHYs use electrical signaling on twisted pairs."],
    ["optical", "Fiber carries light and is not affected by ordinary electromagnetic interference.", "Correct: optical transmission provides EMI immunity."],
    ["fiberpower", "Every fiber cable supplies electrical power to an access point.", "Fiber carries optical data, not power; a separate power source is needed."],
    ["copperdistance", "Copper Ethernet has unlimited reach if the cable is shielded.", "Shielding does not remove Ethernet distance limits."],
  ]),
  ordering("nf-cabling-o1", "cabling", "Order a basic optical Ethernet connection check from physical inspection to link verification.", ["inspect", "match", "seat", "verify"], [
    ["inspect", "Inspect the fiber ends and route for damage or contamination.", "First: obvious contamination or damage should be addressed before connection."],
    ["match", "Confirm fiber type and transceiver specifications match.", "Second: compatible optics and media must be selected."],
    ["seat", "Connect the correct transmit/receive pair and seat connectors.", "Third: make the physical connection with correct polarity."],
    ["verify", "Check link state and optical diagnostics if available.", "Last: verify operation after the physical connection is made."],
  ]),
  simlet("nf-cabling-r1", "cabling", "Read this illustrative interface summary. Which two conclusions are supported?", "Switch# show interfaces status\nPort      Name       Status       Vlan  Duplex  Speed  Type\nGi1/0/1   uplink     connected    trunk full    1000   1000BaseSX\nGi1/0/2   desk-4     notconnect   20    auto    auto   10/100/1000BaseTX", ["fiber", "down"], [
    ["fiber", "Gi1/0/1 is using a 1000BaseSX optical interface.", "Correct: the Type field identifies 1000BaseSX."],
    ["down", "Gi1/0/2 currently has no link detected.", "Correct: notconnect indicates that the interface does not detect a link."],
    ["vlan", "Gi1/0/2 is an operational trunk carrying VLAN 20.", "The status is notconnect and its listed VLAN is 20, not trunk."],
    ["duplex", "Gi1/0/1 negotiated half duplex.", "The output explicitly shows full duplex."],
  ]),

  // Interface and cable issues
  single("nf-errors-s1", "interface-errors", "A switch port's CRC counter rises steadily while the interface remains up. What is a sensible first suspicion?", "physical", [
    ["physical", "A physical-layer issue such as a damaged cable or noisy connection", "Correct: CRC/FCS errors commonly point to corrupted frames from physical problems."],
    ["dns", "An incorrect DNS search suffix", "DNS name resolution does not cause Ethernet frames to fail their CRC check."],
    ["route", "A missing default route on the switch", "A route affects Layer 3 forwarding, not received-frame CRC integrity."],
    ["vlan", "A VLAN name mismatch", "VLAN names do not cause CRC errors on the physical link."],
  ]),
  single("nf-errors-s2", "interface-errors", "Two directly connected Ethernet ports are forced to incompatible speeds. What symptom is plausible?", "link", [
    ["link", "The link may fail to come up or operate unreliably.", "Correct: mismatched speed settings can prevent a valid link or disrupt communication."],
    ["dns", "Only DNS queries will be dropped while all other traffic works.", "A physical negotiation mismatch is not limited to DNS."],
    ["mac", "The switch will learn an extra MAC address for every packet.", "Speed mismatch does not create additional source MAC identities."],
    ["route", "The router will install a more specific route.", "Link speed has no automatic effect on route prefix selection."],
  ]),
  single("nf-errors-s3", "interface-errors", "What does a rapidly increasing output queue-drop count most directly suggest?", "congestion", [
    ["congestion", "The egress interface cannot transmit queued traffic as fast as it arrives.", "Correct: sustained queue drops indicate output congestion or buffering pressure."],
    ["duplex", "The cable is definitely open-circuit.", "An open circuit usually removes link; queue drops alone do not prove a cable break."],
    ["dns", "The DNS server is returning stale records.", "DNS responses do not explain a general egress queue-drop counter."],
    ["mask", "Hosts have the wrong subnet mask.", "Address masks do not directly account for interface output queue drops."],
  ]),
  single("nf-errors-s4", "interface-errors", "If both ends are configured for auto-negotiation, what is usually the preferred way to correct an accidental speed/duplex mismatch?", "auto", [
    ["auto", "Restore compatible auto-negotiation on both ends.", "Correct: both ends should use a consistent negotiation policy."],
    ["half", "Force half duplex on one end only.", "A one-sided forced setting can create another mismatch."],
    ["shutdown", "Keep one side administratively shut.", "Shutdown removes the link rather than resolving the mismatch."],
    ["vlan", "Move the port to a different VLAN.", "VLAN membership does not correct physical negotiation."],
  ]),
  multi("nf-errors-m1", "interface-errors", "Which two counters or symptoms can reasonably help identify physical-link trouble?", ["crc", "flap"], [
    ["crc", "Increasing CRC/FCS errors", "Correct: corrupted received frames often accompany cabling or physical problems."],
    ["flap", "A link repeatedly transitioning up and down", "Correct: intermittent physical connectivity can cause link flaps."],
    ["dns", "An NXDOMAIN response from a resolver", "NXDOMAIN reflects name lookup results, not evidence of a physical Ethernet fault."],
    ["routeage", "A static route's configured age", "Static route age is not a physical-interface error indicator."],
  ]),
  multi("nf-errors-m2", "interface-errors", "A user reports slow transfers but the interface is up. Which two checks are useful early troubleshooting steps?", ["counters", "duplex"], [
    ["counters", "Inspect interface error and discard counters on both ends.", "Correct: counter trends can reveal physical errors or congestion."],
    ["duplex", "Compare speed and duplex settings at both endpoints.", "Correct: mismatch can cause poor performance despite some connectivity."],
    ["ssid", "Change the user's wireless SSID without checking the path.", "This is a wired interface symptom and changing SSID is not a grounded first check."],
    ["hostname", "Rename both devices to identical hostnames.", "Hostnames do not resolve physical link performance problems."],
  ]),
  ordering("nf-errors-o1", "interface-errors", "Order a basic response to a report of Ethernet errors on a connected interface.", ["baseline", "inspect", "compare", "correct"], [
    ["baseline", "Record current counters and link state.", "First: a baseline helps distinguish old counts from newly rising errors."],
    ["inspect", "Inspect connectors, cable seating, and visible damage.", "Second: check straightforward physical causes."],
    ["compare", "Compare speed/duplex and counters with the peer port.", "Third: look for inconsistent settings or one-sided symptoms."],
    ["correct", "Replace/repair the suspect medium or restore compatible settings, then verify.", "Last: make a targeted correction and confirm its effect."],
  ]),
  simlet("nf-errors-r1", "interface-errors", "Given this illustrative counter snapshot, which two statements are justified?", "Switch# show interfaces gi1/0/7\nGigabitEthernet1/0/7 is up, line protocol is up\n  5 minute input rate 12000 bits/sec\n  184 input errors, 176 CRC, 0 frame, 0 overrun\n  12 interface resets", ["crc", "up"], [
    ["crc", "Most reported input errors in the snapshot are CRC errors.", "Correct: 176 of 184 input errors are CRC."],
    ["up", "The interface and line protocol are currently up.", "Correct: both states are explicitly shown as up."],
    ["down", "The port is currently administratively shut.", "The interface is shown up, not administratively down."],
    ["dns", "The output proves a DNS timeout caused the errors.", "Interface counters contain no evidence about DNS behavior."],
  ]),

  // TCP and UDP
  single("nf-tcpudp-s1", "tcp-udp", "Which transport protocol provides sequencing, acknowledgments, and retransmission for reliable ordered byte delivery?", "tcp", [
    ["tcp", "TCP", "Correct: TCP provides connection-oriented reliable, ordered byte-stream delivery."],
    ["udp", "UDP", "UDP does not provide TCP-style acknowledgments and retransmission by itself."],
    ["ip", "IP", "IP provides network-layer addressing and forwarding, not an ordered transport stream."],
    ["arp", "ARP", "ARP resolves IPv4 addresses to local-link MAC addresses; it is not a transport protocol."],
  ]),
  single("nf-tcpudp-s2", "tcp-udp", "Which protocol is a common fit for a latency-sensitive voice stream that can tolerate some packet loss?", "udp", [
    ["udp", "UDP", "Correct: UDP has low transport overhead and does not wait for TCP retransmission."],
    ["tcp", "TCP", "TCP reliability and retransmission can add delay for real-time media."],
    ["icmp", "ICMP", "ICMP carries network control and diagnostic messages, not a typical voice transport stream."],
    ["arp", "ARP", "ARP is local address resolution, not an end-to-end media transport."],
  ]),
  single("nf-tcpudp-s3", "tcp-udp", "What does a TCP three-way handshake establish before application data is exchanged?", "session", [
    ["session", "Synchronized transport connection state between endpoints", "Correct: SYN, SYN-ACK, and ACK establish sequence state and a connection."],
    ["route", "A route on every intermediate router", "The handshake does not configure routing tables on intermediate devices."],
    ["dns", "A mapping from hostname to IP address", "DNS name resolution is separate from TCP connection establishment."],
    ["vlan", "A new Layer 2 VLAN on the path", "TCP does not create VLANs."],
  ]),
  single("nf-tcpudp-s4", "tcp-udp", "Which statement best describes UDP datagram delivery?", "no-guarantee", [
    ["no-guarantee", "UDP does not guarantee delivery, ordering, or retransmission by itself.", "Correct: applications needing those properties must provide them separately."],
    ["ordered", "UDP guarantees every datagram arrives in order.", "UDP does not provide ordered delivery."],
    ["retry", "UDP automatically retransmits every lost datagram.", "UDP has no built-in retransmission mechanism."],
    ["stream", "UDP presents a reliable byte stream.", "A reliable byte stream is a TCP service, not a UDP guarantee."],
  ]),
  multi("nf-tcpudp-m1", "tcp-udp", "Which two statements accurately compare TCP and UDP?", ["tcpstate", "udpheader"], [
    ["tcpstate", "TCP maintains connection state and can retransmit lost data.", "Correct: TCP's connection state supports reliability mechanisms."],
    ["udpheader", "UDP has a smaller transport header than TCP.", "Correct: the UDP header is 8 bytes, compared with a larger TCP header."],
    ["udpordered", "UDP ensures that application messages arrive in order.", "UDP itself does not guarantee ordering."],
    ["tcpbroadcast", "TCP connections use broadcast destination addresses.", "TCP is normally endpoint-to-endpoint and does not use broadcast delivery."],
  ]),
  multi("nf-tcpudp-m2", "tcp-udp", "Which two applications or uses commonly rely on UDP transport?", ["dns", "voice"], [
    ["dns", "A typical DNS query", "Correct: conventional DNS queries commonly use UDP, with TCP used in some cases."],
    ["voice", "Real-time voice media", "Correct: media commonly uses UDP to avoid transport retransmission delays."],
    ["https", "A traditional HTTPS web session", "Traditional HTTPS uses TCP; HTTP/3 uses QUIC over UDP, a distinct case."],
    ["ftp", "A conventional FTP data transfer", "Traditional FTP uses TCP for control and data connections."],
  ]),
  ordering("nf-tcpudp-o1", "tcp-udp", "Order the messages of a TCP connection establishment.", ["syn", "synack", "ack", "data"], [
    ["syn", "Client sends SYN.", "First: the initiator requests a connection and proposes initial sequence state."],
    ["synack", "Server replies SYN-ACK.", "Second: the server acknowledges and provides its own sequence state."],
    ["ack", "Client sends ACK.", "Third: this completes the three-way handshake."],
    ["data", "Application data can be exchanged.", "Last: application transfer follows successful establishment."],
  ]),
  simlet("nf-tcpudp-r1", "tcp-udp", "Read this illustrative socket listing. Which two interpretations are correct?", "Proto  Local Address       Foreign Address     State\nTCP    192.0.2.15:51522    198.51.100.8:443   ESTABLISHED\nUDP    192.0.2.15:53000    *:*                 -", ["tcpconn", "udp"], [
    ["tcpconn", "The TCP endpoint has an established connection to port 443.", "Correct: the TCP row names a foreign endpoint and ESTABLISHED state."],
    ["udp", "The UDP row has no TCP-style connection state shown.", "Correct: UDP is connectionless at the transport layer and has no such state here."],
    ["listener", "The TCP row is a passive listener waiting for clients.", "ESTABLISHED indicates an active connection, not a listening socket."],
    ["dns", "The UDP row proves a DNS response failed.", "The local UDP port alone does not identify the application or a failure."],
  ]),

  // IPv4 addressing and subnetting
  single("nf-ipv4-s1", "ipv4-subnetting", "How many total IPv4 addresses are in a /27 subnet?", "32", [
    ["32", "32 total addresses", "Correct: a /27 leaves 5 host bits, so 2^5 equals 32 addresses."],
    ["30", "30 total addresses", "Thirty is commonly the usable-host count for a /27, not the total."],
    ["64", "64 total addresses", "A /26 has 6 host bits and 64 total addresses."],
    ["16", "16 total addresses", "A /28 has 4 host bits and 16 total addresses."],
  ]),
  single("nf-ipv4-s2", "ipv4-subnetting", "For 192.168.10.77/26, what is the subnet network address?", "64", [
    ["64", "192.168.10.64", "Correct: /26 blocks increment by 64; .77 falls in the .64–.127 block."],
    ["0", "192.168.10.0", "This is the first /26 block, which ends at .63."],
    ["77", "192.168.10.77", "The host address is not the subnet network address."],
    ["128", "192.168.10.128", "This is the next /26 block; .77 is below it."],
  ]),
  single("nf-ipv4-s3", "ipv4-subnetting", "Which prefix length corresponds to subnet mask 255.255.255.240?", "28", [
    ["28", "/28", "Correct: the mask has 28 leading one bits."],
    ["24", "/24", "A /24 mask is 255.255.255.0."],
    ["26", "/26", "A /26 mask is 255.255.255.192."],
    ["30", "/30", "A /30 mask is 255.255.255.252."],
  ]),
  single("nf-ipv4-s4", "ipv4-subnetting", "A subnet is 10.1.4.0/29. Which address is its broadcast address?", "7", [
    ["7", "10.1.4.7", "Correct: a /29 block has eight addresses, from .0 through .7."],
    ["0", "10.1.4.0", "This is the network address, not the broadcast address."],
    ["6", "10.1.4.6", "This is the last conventional usable host address."],
    ["8", "10.1.4.8", "This is the network address of the next /29 block."],
  ]),
  multi("nf-ipv4-m1", "ipv4-subnetting", "Which two addresses are usable host addresses in 192.0.2.64/27?", ["65", "94"], [
    ["65", "192.0.2.65", "Correct: it is between network .64 and broadcast .95."],
    ["94", "192.0.2.94", "Correct: it is the final host address before broadcast .95."],
    ["64", "192.0.2.64", "This is the subnet network address."],
    ["95", "192.0.2.95", "This is the subnet broadcast address."],
  ]),
  multi("nf-ipv4-m2", "ipv4-subnetting", "Which two facts are true of a /30 IPv4 subnet used on a point-to-point link?", ["four", "twohosts"], [
    ["four", "It contains four total addresses.", "Correct: a /30 leaves two host bits, giving four addresses."],
    ["twohosts", "In conventional IPv4 subnetting, it has two usable host addresses.", "Correct: one address is network and one is broadcast."],
    ["sixhosts", "It supports six conventional usable hosts.", "Six usable hosts is associated with a /29, not a /30."],
    ["network30", "The network address is always the address ending in .30.", "Network boundaries depend on the address and prefix, not the digits 30."],
  ]),
  ordering("nf-ipv4-o1", "ipv4-subnetting", "For the address 192.168.5.34/28, put these calculations in order to identify its subnet.", ["mask", "block", "range", "network"], [
    ["mask", "Determine that /28 leaves four host bits.", "First: prefix length reveals the host-bit count."],
    ["block", "Calculate 16 addresses per subnet.", "Second: 2^4 equals 16, the increment in the last octet."],
    ["range", "Locate the block containing .34: .32 through .47.", "Third: .34 falls within that 16-address range."],
    ["network", "Identify .32 as the network address.", "Last: the first address in the block is the network address."],
  ]),
  simlet("nf-ipv4-r1", "ipv4-subnetting", "This illustrative interface configuration is data only. Which two statements about the host are correct?", "Router# show ip interface brief\nInterface       IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0 192.168.8.1  YES manual up                    up\nRouter# show running-config interface g0/0\n ip address 192.168.8.1 255.255.255.224", ["prefix27", "network"], [
    ["prefix27", "The configured mask corresponds to /27.", "Correct: 255.255.255.224 has 27 leading one bits."],
    ["network", "The interface address belongs to network 192.168.8.0/27.", "Correct: /27 blocks increment by 32; .1 is in the .0–.31 block."],
    ["broadcast", "192.168.8.1 is the subnet broadcast address.", "The broadcast for this subnet is 192.168.8.31."],
    ["down", "The interface and protocol are both down.", "Both status fields are shown as up."],
  ]),

  // Private IPv4 addressing
  single("nf-private-s1", "private-ipv4", "Which address is part of the RFC 1918 private IPv4 range 10.0.0.0/8?", "ten", [
    ["ten", "10.24.7.9", "Correct: all addresses beginning with 10 are in 10.0.0.0/8."],
    ["public", "11.24.7.9", "11.0.0.0/8 is not an RFC 1918 private range."],
    ["link", "169.254.7.9", "169.254/16 is IPv4 link-local, not an RFC 1918 private range."],
    ["loop", "127.0.0.1", "127/8 is reserved for loopback."],
  ]),
  single("nf-private-s2", "private-ipv4", "Which IPv4 block is reserved for private use in the 172 range?", "172", [
    ["172", "172.16.0.0/12", "Correct: the private range spans 172.16.0.0 through 172.31.255.255."],
    ["172all", "172.0.0.0/8", "Only 172.16/12 is private; not the whole 172/8 block."],
    ["192", "192.0.0.0/8", "The RFC 1918 192 range is 192.168.0.0/16."],
    ["169", "169.254.0.0/16", "This is link-local addressing, not the private 172 block."],
  ]),
  single("nf-private-s3", "private-ipv4", "A private-addressed workstation needs internet access. Which common edge function can allow its traffic to use a public IPv4 address?", "nat", [
    ["nat", "Network Address Translation", "Correct: NAT can translate private source addresses at the internet edge."],
    ["arp", "Address Resolution Protocol", "ARP resolves a next-hop MAC on a local link; it does not translate private addresses."],
    ["stp", "Spanning Tree Protocol", "STP prevents Layer 2 loops and does not provide public address translation."],
    ["lldp", "Link Layer Discovery Protocol", "LLDP advertises neighbor information and does not translate packets."],
  ]),
  single("nf-private-s4", "private-ipv4", "Which statement about RFC 1918 addresses is accurate?", "notglobal", [
    ["notglobal", "They are not globally routed as public destination addresses on the internet.", "Correct: private ranges are reused internally and ordinarily require translation or a proxy for internet access."],
    ["unique", "Every private address is globally unique.", "Private addresses may be reused by many unrelated organizations."],
    ["encrypted", "Private addressing encrypts traffic automatically.", "An address range provides no encryption."],
    ["public", "All private addresses are assigned by an internet registry for public routing.", "RFC 1918 ranges are reserved for private use, not public assignment."],
  ]),
  multi("nf-private-m1", "private-ipv4", "Which two addresses are RFC 1918 private IPv4 addresses?", ["192168", "17220"], [
    ["192168", "192.168.40.12", "Correct: 192.168.0.0/16 is private."],
    ["17220", "172.20.1.8", "Correct: this is within 172.16.0.0/12."],
    ["17232", "172.32.1.8", "172.32.0.0/16 lies outside private 172.16/12."],
    ["198", "198.51.100.8", "This belongs to a documentation block, not RFC 1918 private space."],
  ]),
  multi("nf-private-m2", "private-ipv4", "Which two statements correctly distinguish private and link-local IPv4 addressing?", ["private", "linklocal"], [
    ["private", "RFC 1918 addresses can be routed within an organization's private network.", "Correct: internal routers may route private prefixes inside the organization."],
    ["linklocal", "169.254/16 addresses are link-local and are not normally routed off their local link.", "Correct: IPv4 link-local scope is local-link only."],
    ["linkinternet", "A 169.254 address is the normal public address for internet NAT.", "169.254/16 is link-local and is not a public NAT address range."],
    ["privatenat", "Private addresses are globally reachable without any edge translation.", "Private addresses are not globally routed as ordinary public destinations."],
  ]),
  ordering("nf-private-o1", "private-ipv4", "Order a typical outbound flow from a private host to a public internet server when source NAT is used.", ["host", "gateway", "translate", "return"], [
    ["host", "Host sends an off-subnet packet to its default gateway.", "First: the host uses its configured gateway."],
    ["gateway", "Edge router receives the packet on the private interface.", "Second: the router processes the outbound packet."],
    ["translate", "Router translates the source to a public address and tracks the mapping.", "Third: NAT creates a mapping for return traffic."],
    ["return", "A reply returns to the public mapping and is translated toward the host.", "Last: the state/mapping guides the response back inside."],
  ]),
  simlet("nf-private-r1", "private-ipv4", "Read this illustrative address-pool excerpt. Which two conclusions follow?", "Edge# show ip nat statistics\nInside interfaces: GigabitEthernet0/0\nOutside interfaces: GigabitEthernet0/1\nHits: 42  Misses: 3\nDynamic mappings: 10.0.0.0/8 -> interface GigabitEthernet0/1", ["inside", "hits"], [
    ["inside", "GigabitEthernet0/0 is identified as the inside NAT interface.", "Correct: it appears under Inside interfaces."],
    ["hits", "The output reports 42 NAT hits.", "Correct: Hits is explicitly reported as 42."],
    ["none", "No dynamic mappings are configured.", "A dynamic mapping is shown for 10.0.0.0/8."],
    ["acl", "The output proves a specific access list permits every internet destination.", "No ACL or destination policy is shown."],
  ]),

  // IPv6 addressing and address types
  single("nf-ipv6-s1", "ipv6-addressing", "Which IPv6 address type is intended for communication on one local link and is not routed by routers?", "linklocal", [
    ["linklocal", "Link-local", "Correct: FE80::/10 addresses are for a local link and are not forwarded by routers."],
    ["global", "Global unicast", "Global unicast is routable beyond the local link."],
    ["unique", "Unique local", "Unique-local addresses are intended for private internetwork use, not just a single link."],
    ["multicast", "Multicast", "Multicast identifies a group of interfaces, not the specific link-local unicast type."],
  ]),
  single("nf-ipv6-s2", "ipv6-addressing", "How many bits are in an IPv6 address?", "128", [
    ["128", "128 bits", "Correct: IPv6 addresses are 128 bits long."],
    ["32", "32 bits", "IPv4 addresses are 32 bits."],
    ["48", "48 bits", "48 bits is a common Ethernet MAC address length."],
    ["64", "64 bits", "A common IPv6 subnet prefix length is /64, but the full address is 128 bits."],
  ]),
  single("nf-ipv6-s3", "ipv6-addressing", "Which prefix identifies IPv6 link-local unicast addresses?", "fe80", [
    ["fe80", "FE80::/10", "Correct: FE80::/10 is reserved for link-local unicast."],
    ["fc00", "FC00::/7", "FC00::/7 is the unique-local address range."],
    ["ff00", "FF00::/8", "FF00::/8 is the IPv6 multicast range."],
    ["2000", "2000::/3", "2000::/3 contains global unicast addresses."],
  ]),
  single("nf-ipv6-s4", "ipv6-addressing", "What does :: represent in a valid compressed IPv6 address?", "zeros", [
    ["zeros", "One or more consecutive groups of 0000", "Correct: :: compresses one or more consecutive zero groups and may appear once."],
    ["broadcast", "The all-nodes broadcast address", "IPv6 has no broadcast addresses; multicast serves group communication."],
    ["gateway", "The default gateway's MAC address", "An IPv6 address is not a MAC address."],
    ["prefix", "Exactly one 16-bit zero group", "The double colon can compress multiple consecutive zero groups, not only one."],
  ]),
  multi("nf-ipv6-m1", "ipv6-addressing", "Which two IPv6 address types can appear as unicast addresses on a network?", ["global", "ula"], [
    ["global", "Global unicast", "Correct: global unicast is a routable unicast address type."],
    ["ula", "Unique local", "Correct: unique-local addresses are unicast addresses intended for private internetworks."],
    ["broadcast", "Broadcast", "IPv6 does not use broadcast addressing."],
    ["anycastgroup", "Multicast group", "Multicast is a group destination, not a unicast address type."],
  ]),
  multi("nf-ipv6-m2", "ipv6-addressing", "Which two IPv6 statements are correct?", ["slaac", "multicast"], [
    ["slaac", "SLAAC can let a host form an address using router advertisements.", "Correct: router advertisements can provide prefix information for stateless autoconfiguration."],
    ["multicast", "IPv6 uses multicast for functions such as neighbor discovery.", "Correct: Neighbor Discovery uses solicited-node and other multicast groups."],
    ["arp", "IPv6 resolves neighbors with IPv4 ARP.", "IPv6 Neighbor Discovery uses ICMPv6 rather than ARP."],
    ["broadcast", "IPv6 subnet broadcasts use the all-ones host address.", "IPv6 has no broadcast mechanism."],
  ]),
  ordering("nf-ipv6-o1", "ipv6-addressing", "Order the IPv6 address components from most significant to least significant for 2001:db8:12:34::9/64.", ["global", "subnet", "interface", "host"], [
    ["global", "Global routing prefix portion: 2001:db8:12", "First: the leading portion is within the global routing prefix."],
    ["subnet", "Subnet ID portion completing the first 64 bits: :34", "Second: the /64 prefix includes the subnet identifier."],
    ["interface", "Interface identifier begins after the /64 boundary.", "Third: the remaining 64 bits are the interface identifier in this /64 example."],
    ["host", "Host uses the resulting full address on the interface.", "Last: the complete address identifies that interface."],
  ]),
  simlet("nf-ipv6-r1", "ipv6-addressing", "Given this illustrative interface output, which two interpretations are accurate?", "Router# show ipv6 interface brief\nGigabitEthernet0/0  [up/up]\n  FE80::A8BB:CCFF:FE00:1201\n  2001:DB8:5:10::1\nLoopback0           [up/up]\n  ::1", ["link", "global"], [
    ["link", "The FE80:: address is link-local.", "Correct: FE80::/10 identifies IPv6 link-local addresses."],
    ["global", "The 2001:DB8:: address is in the documentation prefix used in examples.", "Correct: 2001:DB8::/32 is reserved for documentation."],
    ["broadcast", "::1 is the IPv6 broadcast address.", "IPv6 has no broadcast address; ::1 is loopback."],
    ["down", "GigabitEthernet0/0 is down/down.", "The output explicitly marks it up/up."],
  ]),

  // Client IP configuration
  single("nf-client-s1", "client-ip-config", "A client can ping a server by IP address but cannot reach it by hostname. Which service should be checked first?", "dns", [
    ["dns", "DNS configuration and name resolution", "Correct: connectivity by IP works, while resolving the hostname fails."],
    ["mask", "The client's subnet mask only", "A mask problem could affect reachability, but the stated IP connectivity isolates name resolution as the first check."],
    ["cable", "The Ethernet cable", "Working IP connectivity demonstrates that the link is functioning for this path."],
    ["stp", "Spanning Tree root selection", "A forwarding path is already carrying traffic by IP; DNS is the focused issue."],
  ]),
  single("nf-client-s2", "client-ip-config", "A PC has an address and mask but no default gateway. What is the likely limitation?", "local", [
    ["local", "It may communicate on its local subnet but cannot normally reach remote subnets.", "Correct: the gateway is the next hop for destinations outside the local prefix."],
    ["dns", "It cannot resolve any local hostname under all conditions.", "DNS may still be reachable locally; a missing gateway does not inherently disable all name resolution."],
    ["switch", "It cannot send any Ethernet frames.", "It can still exchange local-link frames."],
    ["address", "Its own IP address is automatically invalid.", "A host address can be valid on-link even without a configured default gateway."],
  ]),
  single("nf-client-s3", "client-ip-config", "A Windows client shows an IPv4 address in 169.254.0.0/16 unexpectedly. What is a likely explanation?", "dhcp", [
    ["dhcp", "It self-assigned a link-local address after failing to obtain a DHCP lease.", "Correct: APIPA/link-local assignment commonly follows DHCP failure."],
    ["public", "It successfully received a globally routable public lease.", "169.254/16 is link-local, not a public allocation."],
    ["gateway", "It received a working default route from the router.", "The address alone does not indicate a successful gateway assignment; link-local hosts generally cannot reach off-link networks."],
    ["ipv6", "It is an IPv6 address displayed in IPv4 notation.", "169.254.0.0/16 is IPv4 notation and an IPv4 link-local range."],
  ]),
  single("nf-client-s4", "client-ip-config", "Which client setting tells a host where to send packets for destinations outside its local subnet?", "gateway", [
    ["gateway", "Default gateway", "Correct: the default gateway is the next hop for unmatched off-subnet destinations."],
    ["dns", "DNS server", "A DNS server resolves names; it is not the general next hop."],
    ["lease", "DHCP lease duration", "Lease duration controls address-configuration timing, not packet forwarding."],
    ["hostname", "Host name", "A host name identifies the client but does not specify its next hop."],
  ]),
  multi("nf-client-m1", "client-ip-config", "Which two settings are commonly needed for a client to use an IPv4 LAN and reach internet services by name?", ["address", "dns"], [
    ["address", "A valid IPv4 address and matching subnet mask/prefix", "Correct: these define the client's local addressing and subnet."],
    ["dns", "A reachable DNS resolver address", "Correct: name-based access needs a resolver, in addition to IP reachability."],
    ["vlanname", "A descriptive VLAN name typed into the IP settings", "A VLAN name is not a client IP configuration setting."],
    ["macroute", "A static route to every internet host on the client", "Clients ordinarily use a default gateway rather than individual routes to every public host."],
  ]),
  multi("nf-client-m2", "client-ip-config", "Which two checks help distinguish a DHCP assignment problem from a DNS-only problem?", ["lease", "iptest"], [
    ["lease", "Inspect the client lease for address, mask, gateway, and DNS values.", "Correct: the lease reveals which settings DHCP supplied."],
    ["iptest", "Test connectivity to a known reachable IP address.", "Correct: successful IP connectivity with failed names points toward DNS."],
    ["rename", "Rename the client's network adapter.", "Changing the adapter name does not diagnose address assignment or DNS resolution."],
    ["channel", "Change the wireless channel without checking signal or association.", "A channel change is not a direct test of DHCP versus DNS."],
  ]),
  ordering("nf-client-o1", "client-ip-config", "Order a client-side check when a user reports that a service name is unreachable.", ["config", "gateway", "ip", "name"], [
    ["config", "Inspect address, prefix/mask, gateway, and DNS settings.", "First: verify the fundamental client configuration."],
    ["gateway", "Check local gateway reachability when the target is remote.", "Second: confirm the next hop is reachable."],
    ["ip", "Test the target or service by IP address if appropriate.", "Third: separate IP path problems from name-resolution issues."],
    ["name", "Query DNS and compare the returned address with the expected service.", "Last: evaluate name resolution after basic IP connectivity is understood."],
  ]),
  simlet("nf-client-r1", "client-ip-config", "Treat this as illustrative client command output. Which two conclusions are supported?", "C:\\> ipconfig /all\nIPv4 Address. . . . . . . . . . : 192.168.30.44\nSubnet Mask . . . . . . . . . . : 255.255.255.0\nDefault Gateway . . . . . . . . : 192.168.30.1\nDNS Servers . . . . . . . . . . : 192.168.30.53", ["same", "dns"], [
    ["same", "The client and gateway addresses are in the same /24 subnet.", "Correct: both 192.168.30.44 and .1 share the first 24 bits."],
    ["dns", "The configured DNS server is 192.168.30.53.", "Correct: this is the DNS Servers value shown."],
    ["mask", "The client is configured with a /16 mask.", "255.255.255.0 corresponds to /24."],
    ["missing", "No default gateway is configured.", "A default gateway of 192.168.30.1 is present."],
  ]),

  // Wireless principles
  single("nf-wireless-s1", "wireless-basics", "Why can two nearby 2.4 GHz access points on overlapping channels reduce WLAN performance?", "interference", [
    ["interference", "Their transmissions contend for overlapping spectrum and airtime.", "Correct: co-channel/adjacent-channel activity can increase contention and interference."],
    ["subnet", "They automatically create duplicate IP subnet masks.", "Radio-channel overlap does not alter IP subnet masks."],
    ["routing", "They force all clients to use TCP instead of UDP.", "Radio channel use does not select transport protocols."],
    ["encryption", "They disable encryption by definition.", "Channel overlap does not inherently change security configuration."],
  ]),
  single("nf-wireless-s2", "wireless-basics", "Which change most directly improves a weak Wi-Fi signal at a distant client?", "placement", [
    ["placement", "Improve AP placement or reduce the distance/obstructions.", "Correct: signal strength depends strongly on distance and obstacles."],
    ["dns", "Change the DNS server to a public resolver.", "DNS choice does not improve radio signal strength."],
    ["mask", "Increase the client's subnet mask length.", "IP prefix length does not affect the RF link budget."],
    ["tcp", "Disable TCP acknowledgments.", "Transport settings do not correct a weak radio signal."],
  ]),
  single("nf-wireless-s3", "wireless-basics", "What is a common advantage of the 5 GHz band compared with 2.4 GHz?", "channels", [
    ["channels", "More non-overlapping channel choices and often less legacy-device congestion.", "Correct: 5 GHz offers more channel options, although range and regulatory rules vary."],
    ["range", "Always longer range and better wall penetration.", "Higher frequencies generally have less range/penetration than 2.4 GHz under comparable conditions."],
    ["compatibility", "Compatibility with every 2.4 GHz-only client.", "A 2.4 GHz-only client cannot associate on 5 GHz."],
    ["interference", "Complete immunity to interference.", "5 GHz is not interference-free; other networks and devices can still affect it."],
  ]),
  single("nf-wireless-s4", "wireless-basics", "What is the effect of a higher signal-to-noise ratio on a Wi-Fi link, all else equal?", "better", [
    ["better", "It generally allows more reliable reception and potentially higher modulation rates.", "Correct: a cleaner signal supports more robust decoding and data rates."],
    ["worse", "It always forces clients to disconnect.", "A higher SNR generally improves, not degrades, reception."],
    ["ip", "It changes the client's IP address.", "Radio SNR does not assign or alter IP addresses."],
    ["vlan", "It changes the WLAN's VLAN mapping.", "VLAN mapping is configuration, not a result of SNR."],
  ]),
  multi("nf-wireless-m1", "wireless-basics", "Which two environmental factors can reduce Wi-Fi performance?", ["obstacle", "congestion"], [
    ["obstacle", "Walls or other obstructions between client and AP", "Correct: materials can attenuate the radio signal."],
    ["congestion", "Many clients or nearby APs contending for the same airtime/channel", "Correct: shared airtime limits per-client capacity."],
    ["hostname", "The length of the SSID string", "SSID length does not directly determine RF signal quality or airtime capacity."],
    ["gateway", "The default gateway's subnet mask value", "A gateway mask issue affects IP connectivity, not the radio environment itself."],
  ]),
  multi("nf-wireless-m2", "wireless-basics", "Which two statements about Wi-Fi bands and channels are accurate?", ["band", "channel"], [
    ["band", "Client and AP must support a common frequency band to associate.", "Correct: a 2.4-GHz-only client cannot join a 5-GHz-only radio."],
    ["channel", "Channel planning can reduce co-channel and adjacent-channel contention.", "Correct: deliberate channel reuse/separation can reduce interference."],
    ["overlap", "Overlapping channels always increase available airtime.", "Overlapping contention generally reduces usable airtime."],
    ["distance", "Channel width has no effect on available spectrum use.", "Wider channels consume more spectrum and can affect channel availability and interference."],
  ]),
  ordering("nf-wireless-o1", "wireless-basics", "Order a basic wireless connectivity investigation from radio association toward application access.", ["associate", "signal", "address", "application"], [
    ["associate", "Confirm the client associates to the intended SSID/AP.", "First: without association there is no WLAN data path."],
    ["signal", "Review signal quality and channel/interference conditions.", "Second: assess the radio link quality."],
    ["address", "Verify the client receives suitable IP and gateway configuration.", "Third: confirm network-layer configuration."],
    ["application", "Test access to the intended application or service.", "Last: validate end-to-end service after lower layers."],
  ]),
  simlet("nf-wireless-r1", "wireless-basics", "Read this illustrative survey summary. Which two statements are supported?", "AP-A radio 2.4 GHz channel 6 utilization 82%\nAP-B radio 2.4 GHz channel 6 utilization 76%\nAP-C radio 5 GHz channel 44 utilization 18%\nClient-X RSSI from AP-A: -82 dBm", ["busy", "weak"], [
    ["busy", "The two 2.4 GHz radios share channel 6 and show high utilization.", "Correct: both list channel 6, with utilization above 75%."],
    ["weak", "Client-X has a weak received signal from AP-A compared with a stronger, less negative RSSI.", "Correct: -82 dBm is a low received signal level in typical WLAN contexts."],
    ["clear", "Channel 6 is unused in this area.", "Both AP-A and AP-B use channel 6."],
    ["fast", "The output proves Client-X achieves a particular throughput.", "RSSI and utilization alone do not state a measured throughput."],
  ]),

  // Virtualization
  single("nf-virtual-s1", "virtualization", "What connects virtual machine network interfaces to physical network interfaces on a host?", "vswitch", [
    ["vswitch", "A virtual switch", "Correct: virtual switches provide Layer 2 connectivity between VMs and host uplinks."],
    ["hypervisor", "A DNS resolver", "DNS resolves names and does not switch VM frames."],
    ["router", "A physical console server", "A console server provides management access, not VM data-plane switching."],
    ["nat", "An access point", "An AP serves wireless clients; it is not inherently the VM switching component."],
  ]),
  single("nf-virtual-s2", "virtualization", "What is a key benefit of running multiple virtual machines on one physical server?", "sharing", [
    ["sharing", "Compute resources can be shared among isolated software-defined machines.", "Correct: virtualization consolidates workloads while maintaining logical separation."],
    ["cabling", "It eliminates the need for any physical network interfaces.", "Hosts still need physical connectivity for external network access."],
    ["broadcast", "It removes all Layer 2 broadcast traffic.", "Virtualization does not inherently eliminate broadcasts."],
    ["routing", "It automatically provides internet routing without configuration.", "Routing and external connectivity still require appropriate network configuration."],
  ]),
  single("nf-virtual-s3", "virtualization", "Which component presents and schedules CPU, memory, and device resources for guest virtual machines?", "hypervisor", [
    ["hypervisor", "Hypervisor", "Correct: a hypervisor manages VM execution and virtualized hardware resources."],
    ["resolver", "DNS resolver", "A resolver performs name lookups, not compute virtualization."],
    ["switch", "Physical access switch", "A physical switch forwards network traffic but does not schedule guest CPU."],
    ["controller", "Wireless LAN controller", "A WLAN controller manages wireless infrastructure, not server VM resources."],
  ]),
  single("nf-virtual-s4", "virtualization", "A VM must communicate with another VM on the same host. What can provide their local Layer 2 path?", "virtual-switch", [
    ["virtual-switch", "A host virtual switch", "Correct: a virtual switch can forward frames between local VM interfaces."],
    ["wan", "A WAN circuit", "A WAN circuit connects remote networks and is unnecessary for same-host local switching."],
    ["dns", "A DNS zone", "DNS maps names; it is not the data-plane path."],
    ["serial", "A serial console connection", "A console connection is for management and does not carry VM Ethernet frames."],
  ]),
  multi("nf-virtual-m1", "virtualization", "Which two statements about virtual networking are accurate?", ["vnic", "isolation"], [
    ["vnic", "A VM can have a virtual NIC connected to a virtual switch.", "Correct: this is the common virtual network attachment model."],
    ["isolation", "Virtual network segments can provide logical separation between workloads.", "Correct: virtual switches and network policy can separate traffic."],
    ["physical", "A virtual switch must always be a separate physical appliance.", "A virtual switch is software implemented on the host or platform."],
    ["vmroute", "Every VM-to-VM packet must traverse an internet router.", "VMs on one virtual segment can communicate locally without an internet router."],
  ]),
  multi("nf-virtual-m2", "virtualization", "Which two examples use virtualization concepts in networking or compute?", ["vm", "function"], [
    ["vm", "Multiple guest operating systems share a hypervisor-managed server.", "Correct: this is server virtualization."],
    ["function", "A virtual network function provides routing/firewall software on shared compute.", "Correct: network functions can be implemented in software."],
    ["hub", "An unmanaged repeater divides one server into guest operating systems.", "A repeater is a physical Layer 1 device and does not virtualize compute."],
    ["cable", "A fiber patch cord schedules CPU for an application.", "A cable is physical media and does not schedule compute."],
  ]),
  ordering("nf-virtual-o1", "virtualization", "Order the typical outbound path from a VM to an external Ethernet network.", ["guest", "vnic", "vswitch", "uplink"], [
    ["guest", "Guest operating system creates an Ethernet frame.", "First: the guest initiates its network transmission."],
    ["vnic", "The frame leaves through the VM's virtual NIC.", "Second: the guest's virtual interface connects it to the host network."],
    ["vswitch", "Host virtual switch forwards toward an external uplink.", "Third: virtual switching selects the host egress."],
    ["uplink", "Physical NIC carries traffic onto the physical network.", "Last: the host uplink delivers the frame outside the server."],
  ]),
  simlet("nf-virtual-r1", "virtualization", "Treat this as illustrative host inventory. Which two statements are supported?", "Host vSwitch0\n  Port VM-web-01 -> vNIC 00:50:56:aa:10:01, VLAN 30\n  Port VM-db-01  -> vNIC 00:50:56:aa:10:02, VLAN 30\n  Uplink vmnic0 -> physical switch Gi1/0/24", ["samevlan", "uplink"], [
    ["samevlan", "Both listed VMs are attached to VLAN 30 on the virtual switch.", "Correct: each VM port is marked VLAN 30."],
    ["uplink", "The virtual switch has an uplink mapped to physical vmnic0.", "Correct: vmnic0 is explicitly listed as an uplink."],
    ["different", "The two VMs are assigned to different VLANs.", "Both entries specify VLAN 30."],
    ["route", "The output proves the virtual switch routes between VLANs.", "It shows port/VLAN mapping, not a Layer 3 routing function."],
  ]),

  // Switching concepts
  single("nf-switching-s1", "switching-concepts", "A switch receives a frame with an unknown destination MAC in a VLAN. What does it normally do?", "flood", [
    ["flood", "Flood it out eligible ports in that VLAN except the ingress port.", "Correct: unknown unicast frames are flooded within the VLAN."],
    ["route", "Send it to the default router without checking the frame.", "A Layer 2 switch does not send unknown unicast directly to a router by default."],
    ["drop", "Always discard the frame.", "Ordinary switching behavior is to flood unknown unicast within the VLAN."],
    ["all", "Transmit it back out the ingress port and every port in every VLAN.", "The ingress port is excluded and flooding is confined to the VLAN."],
  ]),
  single("nf-switching-s2", "switching-concepts", "Which source address does an Ethernet switch normally use to learn a MAC-table entry?", "source", [
    ["source", "The source MAC address of an incoming frame", "Correct: the switch records that source on the frame's ingress port and VLAN."],
    ["destination", "The destination MAC address only", "Destination addresses are used for forwarding lookup, not source learning."],
    ["ip", "The source IPv4 address", "Ordinary Layer 2 MAC learning does not use the source IP."],
    ["gateway", "The configured default gateway address", "The gateway setting does not populate learned source MAC entries."],
  ]),
  single("nf-switching-s3", "switching-concepts", "How does a switch normally handle an Ethernet broadcast frame within a VLAN?", "flood", [
    ["flood", "Flood it to all eligible ports in that VLAN except the ingress port.", "Correct: broadcast frames are distributed within their Layer 2 broadcast domain."],
    ["route", "Forward only to the router port.", "A broadcast is not ordinarily restricted to the router port."],
    ["drop", "Drop every broadcast frame by default.", "Switches normally flood VLAN broadcasts, subject to configured controls."],
    ["other", "Flood it into every VLAN on the switch.", "VLAN boundaries contain Layer 2 broadcast flooding."],
  ]),
  single("nf-switching-s4", "switching-concepts", "A known destination MAC is associated with the ingress port itself. What does a switch typically do?", "filter", [
    ["filter", "Filter the frame rather than send it back out the same port.", "Correct: a switch need not forward a frame back through its ingress port."],
    ["flood", "Flood it to all other VLANs.", "Switch forwarding is confined to the VLAN and known unicast is not flooded like that."],
    ["route", "Route it based only on the destination MAC.", "MAC-based Layer 2 switching does not perform an IP route lookup."],
    ["learn", "Rewrite the source MAC address to the switch's own address.", "A normal bridge does not rewrite source MAC addresses this way."],
  ]),
  multi("nf-switching-m1", "switching-concepts", "Which two events can cause a switch to flood frames within a VLAN?", ["unknown", "broadcast"], [
    ["unknown", "A unicast frame's destination MAC is not in the forwarding table.", "Correct: unknown unicast is flooded to eligible VLAN ports."],
    ["broadcast", "A frame has the Ethernet broadcast destination.", "Correct: broadcasts are flooded within their VLAN."],
    ["known", "A known unicast frame is destined for a different learned port.", "Known unicast is forwarded only to its mapped port."],
    ["sameport", "A known unicast destination is on the same port the frame arrived on.", "Such frames are generally filtered, not flooded."],
  ]),
  multi("nf-switching-m2", "switching-concepts", "Which two facts about a dynamically learned MAC table are true?", ["sourceport", "aging"], [
    ["sourceport", "A learned entry associates a MAC address with a VLAN and ingress port.", "Correct: the forwarding database is VLAN-aware and maps addresses to ports."],
    ["aging", "Dynamic entries can age out after a period without being relearned.", "Correct: aging removes stale dynamic forwarding information."],
    ["iproute", "Every learned MAC entry is an IP route.", "MAC table entries are Layer 2 forwarding state, not IP routes."],
    ["permanent", "Every dynamic entry remains forever until manually deleted.", "Dynamic entries typically age out."],
  ]),
  ordering("nf-switching-o1", "switching-concepts", "Order a switch's handling of a newly received unicast frame with a source and destination MAC.", ["learn", "lookup", "forward", "age"], [
    ["learn", "Learn the source MAC on the ingress port and VLAN.", "First: source learning updates the forwarding database."],
    ["lookup", "Look up the destination MAC in that VLAN's table.", "Second: the destination lookup determines forwarding behavior."],
    ["forward", "Forward to the learned port or flood if the destination is unknown.", "Third: apply the lookup result to the frame."],
    ["age", "Eventually age stale dynamic entries if they are not refreshed.", "Last: aging is a later maintenance process."],
  ]),
  simlet("nf-switching-r1", "switching-concepts", "Read this illustrative forwarding table and frame observation. Which two results are expected?", "Switch# show mac address-table dynamic\nVlan    Mac Address       Type        Ports\n30      00aa.aaaa.0001    DYNAMIC     Gi1/0/4\n30      00bb.bbbb.0002    DYNAMIC     Gi1/0/9\n\nObserved ingress: Gi1/0/2, VLAN 30\nSource: 00cc.cccc.0003  Destination: 00bb.bbbb.0002", ["learn", "known"], [
    ["learn", "The switch can learn source 00cc.cccc.0003 on Gi1/0/2 in VLAN 30.", "Correct: source learning records the observed source on its ingress VLAN and port."],
    ["known", "The frame's destination is already mapped to Gi1/0/9 in VLAN 30.", "Correct: the table includes that destination MAC on Gi1/0/9."],
    ["unknown", "The destination is unknown and must be flooded.", "The destination already has a dynamic table entry."],
    ["cross", "The switch will route the frame into VLAN 30 from another VLAN.", "The observed frame is already in VLAN 30 and the output is not a routing table."],
  ]),

  // VLANs and port membership
  single("na-vlans-s1", "vlans", "What is the primary Layer 2 effect of placing switch ports in different VLANs?", "domains", [
    ["domains", "They create separate broadcast domains.", "Correct: VLAN membership separates Layer 2 broadcast traffic."],
    ["speed", "They automatically increase every port's negotiated speed.", "VLAN assignment does not change physical link speed."],
    ["encryption", "They encrypt frames between ports.", "VLANs provide segmentation, not encryption."],
    ["routing", "They automatically route between the VLANs.", "Inter-VLAN communication requires a Layer 3 routing function."],
  ]),
  single("na-vlans-s2", "vlans", "A user-facing switch port normally assigned to one VLAN should be configured as what port role?", "access", [
    ["access", "Access port", "Correct: access ports carry endpoint traffic for one assigned VLAN."],
    ["trunk", "Trunk port", "A trunk carries multiple VLANs, usually between network devices."],
    ["routed", "Routed port", "A routed port is Layer 3 and is not a normal single-VLAN Layer 2 access port."],
    ["mirror", "SPAN destination port", "A mirror destination is for copied traffic, not normal endpoint VLAN membership."],
  ]),
  single("na-vlans-s3", "vlans", "Which VLAN is commonly the default for untagged traffic on an IEEE 802.1Q trunk unless changed?", "native", [
    ["native", "The native VLAN", "Correct: the trunk's native VLAN carries untagged traffic by default."],
    ["voice", "Voice VLAN", "A voice VLAN is a separate access-port feature, not the trunk's default untagged VLAN."],
    ["management", "Management VLAN", "Management VLAN selection does not define the trunk's native VLAN automatically."],
    ["guest", "Guest VLAN", "Guest VLAN is an access-control concept, not the default native VLAN."],
  ]),
  single("na-vlans-s4", "vlans", "Two hosts are in different VLANs on the same switch. What is required for them to communicate at Layer 3?", "routing", [
    ["routing", "A router or Layer 3 switch with routing between the VLANs", "Correct: separate VLANs are separate IP broadcast domains and need routing."],
    ["bridge", "A longer Ethernet patch cord", "Cable length does not bridge separate VLANs."],
    ["stp", "A spanning-tree root change", "STP controls Layer 2 loops and does not route between VLANs."],
    ["ssid", "The same wireless SSID name", "An SSID name alone does not enable inter-VLAN routing."],
  ]),
  multi("na-vlans-m1", "vlans", "Which two statements about VLAN assignment are correct?", ["accesssingle", "broadcast"], [
    ["accesssingle", "An access port generally associates endpoint traffic with one data VLAN.", "Correct: access ports normally carry one untagged user VLAN."],
    ["broadcast", "Broadcast traffic is contained within its VLAN at Layer 2.", "Correct: separate VLANs form separate broadcast domains."],
    ["automatic", "Creating a VLAN automatically creates a gateway interface for it.", "A VLAN database entry alone does not create a Layer 3 gateway."],
    ["security", "VLAN separation by itself encrypts user traffic.", "VLANs segment traffic but do not encrypt it."],
  ]),
  multi("na-vlans-m2", "vlans", "Which two details should be verified when an endpoint cannot reach devices in its intended VLAN?", ["membership", "gateway"], [
    ["membership", "Confirm the switch access port is assigned to the intended VLAN.", "Correct: a wrong port VLAN places the endpoint in a different Layer 2 domain."],
    ["gateway", "Confirm the endpoint's IP prefix and gateway match that VLAN's subnet.", "Correct: Layer 3 settings must correspond to the assigned VLAN."],
    ["root", "Change the STP root before checking VLAN assignment.", "STP root selection is not the first check for a host placed in the wrong VLAN."],
    ["ssid", "Rename the host to include the VLAN number.", "Hostname text does not set VLAN membership."],
  ]),
  ordering("na-vlans-o1", "vlans", "Order the basic switch actions to place an endpoint in a new VLAN.", ["create", "assign", "connect", "verify"], [
    ["create", "Create the VLAN on the switch.", "First: the VLAN must exist in the relevant switching domain."],
    ["assign", "Assign the endpoint-facing port to that VLAN.", "Second: configure port membership."],
    ["connect", "Connect the endpoint to the configured port.", "Third: attach the host to its intended access port."],
    ["verify", "Verify port status, VLAN membership, and host addressing.", "Last: confirm both switching and endpoint configuration."],
  ]),
  simlet("na-vlans-r1", "vlans", "Read this illustrative switch data. Which two statements are supported?", "Switch# show vlan brief\nVLAN Name       Status  Ports\n10   STAFF      active  Gi1/0/1, Gi1/0/2\n20   GUEST      active  Gi1/0/3\n\nSwitch# show interfaces gi1/0/2 switchport\nAdministrative Mode: static access\nAccess Mode VLAN: 10", ["staff", "access"], [
    ["staff", "Gi1/0/2 is an access port assigned to VLAN 10.", "Correct: the switchport output explicitly identifies static access and VLAN 10."],
    ["access", "VLAN 20 is shown active with Gi1/0/3 listed as a member.", "Correct: the VLAN table lists VLAN 20 active and Gi1/0/3."],
    ["trunk", "Gi1/0/2 is operating as a trunk.", "Its administrative mode is static access."],
    ["inactive", "VLAN 10 is inactive.", "The VLAN table marks VLAN 10 active."],
  ]),

  // Trunks and inter-VLAN concepts
  single("na-trunks-s1", "trunks", "What does an 802.1Q trunk allow between compatible switches?", "multiple", [
    ["multiple", "It carries traffic for multiple VLANs over one physical link using tags.", "Correct: VLAN tags identify traffic on a multi-VLAN link."],
    ["single", "It carries exactly one untagged VLAN and no others.", "That is closer to an access link, not a trunk."],
    ["route", "It routes all VLANs without a Layer 3 interface.", "A trunk transports VLAN frames; it does not itself perform routing."],
    ["wireless", "It converts Ethernet frames into Wi-Fi radio signals.", "A trunk is a wired VLAN-carrying link, not an AP radio."],
  ]),
  single("na-trunks-s2", "trunks", "Two switches have a trunk, but VLAN 30 is missing from the allowed list. What happens to VLAN 30 traffic on that trunk?", "blocked", [
    ["blocked", "VLAN 30 traffic is not carried across that trunk.", "Correct: a VLAN excluded from the allowed set is filtered from that link."],
    ["native", "It is automatically sent untagged as the native VLAN.", "The native VLAN setting does not override an allowed-VLAN exclusion."],
    ["routed", "It is automatically routed across the trunk.", "A trunk does not automatically route missing VLAN traffic."],
    ["broadcast", "It is copied into every allowed VLAN.", "Frames are not translated into unrelated VLANs."],
  ]),
  single("na-trunks-s3", "trunks", "Which function is required for hosts in two VLANs to exchange IP traffic?", "layer3", [
    ["layer3", "A Layer 3 gateway with interfaces or subinterfaces for the VLANs", "Correct: inter-VLAN traffic needs a routing function."],
    ["trunkonly", "A trunk alone between two access switches", "The trunk carries VLANs but does not route between their IP subnets."],
    ["mac", "A larger MAC address table", "MAC capacity does not provide Layer 3 forwarding."],
    ["native", "The same native VLAN on every endpoint port", "Endpoint access ports are not made inter-VLAN routers by native VLAN settings."],
  ]),
  single("na-trunks-s4", "trunks", "A router-on-a-stick design uses what on the router-facing Ethernet interface?", "subinterfaces", [
    ["subinterfaces", "Logical subinterfaces with VLAN encapsulation and gateway IPs", "Correct: router subinterfaces associate VLAN tags with Layer 3 gateways."],
    ["access", "One access port per VLAN on the same physical router interface", "A single physical link uses tagged subinterfaces rather than one access port per VLAN."],
    ["loopback", "Only a loopback interface with no VLAN attachment", "A loopback does not receive tagged frames from the switch trunk."],
    ["console", "A console interface for each VLAN", "Console interfaces are for management, not packet routing."],
  ]),
  multi("na-trunks-m1", "trunks", "Which two conditions are important for VLAN traffic to cross an 802.1Q trunk?", ["trunk", "allowed"], [
    ["trunk", "Both endpoints must operate compatibly as a trunk.", "Correct: a mismatch between access and trunk modes can prevent expected tagged carriage."],
    ["allowed", "The VLAN must be permitted on the trunk.", "Correct: VLANs excluded from the allowed list are not carried."],
    ["dns", "Both switches must use the same DNS server.", "DNS settings do not determine tagged Layer 2 forwarding."],
    ["routing", "Every trunk must have an IP address on each physical endpoint.", "Layer 2 trunks do not require physical IP addresses; routing is configured separately."],
  ]),
  multi("na-trunks-m2", "trunks", "Which two statements accurately describe access links and trunks?", ["access", "tagged"], [
    ["access", "An access port ordinarily associates untagged endpoint frames with one VLAN.", "Correct: the access port classifies incoming untagged frames into its configured VLAN."],
    ["tagged", "A trunk uses VLAN tags to distinguish many VLANs on a link.", "Correct: 802.1Q tags identify VLAN membership on trunks, except native handling."],
    ["automatic", "A trunk automatically provides IP connectivity between its VLANs.", "A trunk is Layer 2 transport; inter-VLAN routing is separate."],
    ["nativeall", "Every VLAN on a trunk is always sent untagged.", "Normally tagged VLAN frames carry 802.1Q tags; native VLAN treatment is the exception."],
  ]),
  ordering("na-trunks-o1", "trunks", "Order the key elements of a router-on-a-stick path from the client toward another VLAN.", ["client", "access", "trunk", "subinterface"], [
    ["client", "Client sends a frame toward its configured default gateway.", "First: off-subnet traffic is addressed to the gateway."],
    ["access", "Access switch receives the frame in the client's VLAN.", "Second: the edge port assigns the local VLAN context."],
    ["trunk", "Switch carries the VLAN-tagged frame over the router link.", "Third: the trunk transports the VLAN identity."],
    ["subinterface", "Router subinterface routes the packet toward the destination VLAN.", "Last: the VLAN-associated gateway performs Layer 3 forwarding."],
  ]),
  simlet("na-trunks-r1", "trunks", "Read this illustrative trunk output. Which two conclusions are correct?", "Switch# show interfaces trunk\nPort    Mode  Encapsulation Status    Native vlan\nGi1/0/24 on    802.1q        trunking  99\n\nPort    Vlans allowed on trunk\nGi1/0/24 10,20,99\nPort    Vlans forwarding and not pruned\nGi1/0/24 10,20,99", ["native99", "allowed"], [
    ["native99", "VLAN 99 is configured as the native VLAN on Gi1/0/24.", "Correct: the Native vlan column shows 99."],
    ["allowed", "VLANs 10, 20, and 99 are listed as allowed and forwarding.", "Correct: both allowed and forwarding lists include those VLANs."],
    ["vlan30", "VLAN 30 is listed as allowed on the trunk.", "VLAN 30 does not appear in the allowed list."],
    ["access", "Gi1/0/24 is an access port.", "The Status column identifies it as trunking."],
  ]),

  // CDP and LLDP
  single("na-discovery-s1", "discovery-protocols", "What kind of information can CDP or LLDP provide about a directly connected neighbor?", "neighbor", [
    ["neighbor", "Neighbor identity, advertised capabilities, and local/remote port details", "Correct: discovery output helps identify directly connected devices and interfaces."],
    ["route", "A complete end-to-end internet route trace", "Neighbor discovery is local-link information, not end-to-end path discovery."],
    ["password", "The neighbor's plaintext administrator password", "CDP/LLDP do not advertise device passwords."],
    ["lease", "Every client's DHCP lease and DNS query history", "Neighbor protocols describe adjacent network devices, not client lease histories."],
  ]),
  single("na-discovery-s2", "discovery-protocols", "Which standards-based neighbor discovery protocol can interoperate across vendors?", "lldp", [
    ["lldp", "LLDP", "Correct: IEEE 802.1AB LLDP is a vendor-neutral neighbor discovery protocol."],
    ["cdp", "CDP", "CDP is Cisco-proprietary rather than the standards-based choice."],
    ["stp", "STP", "Spanning Tree prevents Layer 2 loops and is not a neighbor-information protocol."],
    ["lacp", "LACP", "LACP negotiates link aggregation, not general neighbor discovery."],
  ]),
  single("na-discovery-s3", "discovery-protocols", "A discovered neighbor is identified as a switch with a management address and remote port ID. What is the most useful immediate inference?", "adjacent", [
    ["adjacent", "The local interface has a directly connected switch neighbor.", "Correct: neighbor discovery reports an adjacent device and its advertised port."],
    ["route", "The neighbor is necessarily the next hop to every destination.", "A directly connected neighbor is not necessarily the router for all destinations."],
    ["wireless", "The neighbor's remote port is a wireless radio channel.", "A remote port ID generally identifies an interface, not necessarily a radio channel."],
    ["root", "The neighbor is necessarily the spanning-tree root.", "Discovery information alone does not establish STP root status."],
  ]),
  single("na-discovery-s4", "discovery-protocols", "Why might an operator disable CDP on an interface connected to an untrusted endpoint?", "exposure", [
    ["exposure", "To avoid advertising device/platform details to that endpoint.", "Correct: discovery advertisements can reveal topology and device information."],
    ["routing", "To make the interface start routing IP packets.", "Disabling CDP does not change Layer 2/Layer 3 forwarding mode."],
    ["speed", "To force the interface to negotiate a higher speed.", "CDP does not control Ethernet speed negotiation."],
    ["vlan", "To remove the port from its configured VLAN.", "Discovery protocol configuration does not change VLAN membership."],
  ]),
  multi("na-discovery-m1", "discovery-protocols", "Which two pieces of data may neighbor discovery output report?", ["device", "port"], [
    ["device", "The neighbor's system name or device identifier.", "Correct: device identity is a common advertised field."],
    ["port", "The neighbor's port identifier connected to the local link.", "Correct: remote interface identification helps map cabling."],
    ["secret", "The neighbor's enable secret in cleartext.", "Neighbor discovery is not intended to advertise credentials."],
    ["payload", "All user payloads currently crossing the neighbor.", "Discovery advertisements do not provide packet-content capture."],
  ]),
  multi("na-discovery-m2", "discovery-protocols", "Which two statements about CDP and LLDP are true?", ["local", "disable"], [
    ["local", "They help identify directly connected neighbors rather than arbitrary remote devices.", "Correct: their scope is the local link/adjacency."],
    ["disable", "They can be disabled globally or on selected interfaces, depending on platform.", "Correct: administrators can control advertisement/processing scope."],
    ["routing", "They replace routing protocols for learning remote networks.", "They provide neighbor information, not routing tables."],
    ["secure", "Their presence encrypts all traffic on the link.", "Neither protocol is an encryption mechanism."],
  ]),
  ordering("na-discovery-o1", "discovery-protocols", "Order how an operator can use neighbor discovery to map an unknown switch connection.", ["enable", "query", "identify", "verify"], [
    ["enable", "Ensure an appropriate discovery protocol is enabled on the link.", "First: no advertisements are available if discovery is disabled."],
    ["query", "Inspect neighbors on the local device.", "Second: retrieve the advertised adjacency information."],
    ["identify", "Use the remote device and port fields to form a cabling hypothesis.", "Third: interpret the reported neighbor details."],
    ["verify", "Confirm the physical connection and intended configuration.", "Last: validate the finding rather than assuming all advertisements are current."],
  ]),
  simlet("na-discovery-r1", "discovery-protocols", "Read this illustrative neighbor output. Which two statements are supported?", "Switch# show lldp neighbors\nDevice ID       Local Intf  Hold-time  Capability  Port ID\nrouter-east     Gi1/0/24    110        R           Gi0/0\nap-lobby        Gi1/0/10    95         W           Eth0", ["router", "port"], [
    ["router", "router-east is advertised as a directly connected neighbor on local Gi1/0/24.", "Correct: the row identifies that local interface and neighbor."],
    ["port", "The neighbor advertises its connected interface as Gi0/0.", "Correct: Gi0/0 appears in the Port ID column."],
    ["remote", "router-east is proven to be several routed hops away.", "LLDP reports directly connected neighbors, not multi-hop distance."],
    ["root", "router-east is confirmed as the STP root bridge.", "The output lists capability R but does not report STP root status."],
  ]),

  // EtherChannel and LACP
  single("na-ether-s1", "etherchannel", "What is the primary result of bundling compatible Ethernet links into an EtherChannel?", "logical", [
    ["logical", "The member links operate as one logical port-channel.", "Correct: a bundle is presented as a logical link to forwarding protocols."],
    ["route", "Each member becomes an independent IP router.", "EtherChannel aggregates links; it does not turn them into routers."],
    ["vlan", "All VLANs are automatically deleted.", "Bundling does not remove VLAN configuration."],
    ["wireless", "The links become a shared Wi-Fi radio.", "EtherChannel is wired link aggregation."],
  ]),
  single("na-ether-s2", "etherchannel", "Which LACP modes can form a bundle by actively negotiating?", "active", [
    ["active", "Active", "Correct: active mode initiates LACP negotiation."],
    ["passive", "Passive", "Passive responds to LACP but does not initiate it alone."],
    ["on", "Static on", "Static on does not use LACP negotiation."],
    ["auto", "PAgP auto", "PAgP auto is not an LACP mode and does not initiate LACP."],
  ]),
  single("na-ether-s3", "etherchannel", "What is likely if one side of an LACP link is active and the other is passive?", "forms", [
    ["forms", "The bundle can form because active initiates and passive responds.", "Correct: at least one side must initiate LACP; active/passive satisfies this."],
    ["fails", "It cannot form because both sides must be active.", "LACP permits active/passive negotiation."],
    ["static", "It forms as a static channel without LACP.", "These are LACP modes, not static configuration."],
    ["route", "It forms only after the links receive IP addresses.", "LACP operates at Layer 2 and does not require member IP addresses."],
  ]),
  single("na-ether-s4", "etherchannel", "Which configuration mismatch commonly prevents physical interfaces from joining the same EtherChannel?", "vlan", [
    ["vlan", "Inconsistent trunk/access mode or allowed VLAN settings", "Correct: member links need compatible Layer 2 settings."],
    ["hostname", "Different hostnames on the two switches", "Device hostnames do not need to match to negotiate a channel."],
    ["dns", "Different DNS resolver addresses", "DNS settings are unrelated to link aggregation."],
    ["clock", "Different system clock time zones", "Clock configuration does not determine EtherChannel membership."],
  ]),
  multi("na-ether-m1", "etherchannel", "Which two conditions are important for member links to form a consistent EtherChannel?", ["settings", "lacp"], [
    ["settings", "Member links should have compatible speed/duplex and Layer 2 configuration.", "Correct: mismatched member settings can prevent bundling or cause inconsistency."],
    ["lacp", "For LACP, at least one side must be in active mode.", "Correct: passive/passive does not initiate negotiation."],
    ["ip", "Each physical member must have a unique Layer 3 address.", "Layer 2 port-channel members are not individually assigned routed addresses."],
    ["dns", "Both endpoints must use identical DNS records.", "DNS has no role in LACP negotiation."],
  ]),
  multi("na-ether-m2", "etherchannel", "Which two benefits can a correctly configured EtherChannel provide?", ["capacity", "redundancy"], [
    ["capacity", "Aggregate bandwidth across member links for distributed flows.", "Correct: multiple links can increase aggregate capacity, though a single flow is typically hashed to one member."],
    ["redundancy", "Continued logical connectivity if a member link fails and other members remain.", "Correct: surviving links can keep the port-channel operational."],
    ["singleflow", "Every single flow is guaranteed to use all links simultaneously.", "Most implementations hash each flow onto a member; one flow is not necessarily striped across all links."],
    ["loop", "Automatic elimination of all Layer 2 loops without spanning tree.", "EtherChannel does not replace STP loop prevention."],
  ]),
  ordering("na-ether-o1", "etherchannel", "Order a simplified LACP bundle bring-up and validation.", ["match", "negotiate", "bundle", "verify"], [
    ["match", "Configure compatible member-link and channel parameters on both ends.", "First: mismatched physical or Layer 2 settings must be corrected."],
    ["negotiate", "Allow LACP peers to exchange negotiation messages.", "Second: active/passive negotiation identifies eligible members."],
    ["bundle", "Eligible physical links join the logical port-channel.", "Third: the channel forms from the negotiated members."],
    ["verify", "Check channel state, member status, and traffic counters.", "Last: verify that the intended members are actually forwarding."],
  ]),
  simlet("na-ether-r1", "etherchannel", "Read this illustrative EtherChannel summary. Which two conclusions follow?", "Switch# show etherchannel summary\nGroup  Port-channel  Protocol  Ports\n1      Po1(SU)       LACP      Gi1/0/1(P) Gi1/0/2(P)\n\nLegend: S = Layer 2, U = in use, P = bundled in port-channel", ["layer2", "members"], [
    ["layer2", "Po1 is a Layer 2 port-channel currently in use.", "Correct: SU means Layer 2 and in use."],
    ["members", "Both listed physical ports are bundled in the channel.", "Correct: each member has the P bundled flag."],
    ["down", "Po1 is down and has no active members.", "The output marks it in use and both members bundled."],
    ["static", "The channel is static and does not use LACP.", "The Protocol column explicitly says LACP."],
  ]),

  // Spanning Tree and Rapid PVST+
  single("na-stp-s1", "spanning-tree", "What problem does Spanning Tree primarily prevent in a redundant Layer 2 topology?", "loops", [
    ["loops", "Forwarding loops that can cause broadcast storms and MAC instability.", "Correct: STP blocks redundant paths as needed to form a loop-free active topology."],
    ["subnet", "Overlapping IP subnet masks", "STP operates at Layer 2 and does not resolve IP addressing overlap."],
    ["dns", "Duplicate DNS records", "DNS records are outside Spanning Tree's function."],
    ["wireless", "Radio-frequency interference", "STP controls Ethernet bridging loops, not RF conditions."],
  ]),
  single("na-stp-s2", "spanning-tree", "In a spanning-tree instance, which bridge is selected as the root?", "id", [
    ["id", "The bridge with the lowest bridge ID.", "Correct: root election selects the lowest bridge ID, comprising priority and MAC tie-breaker."],
    ["speed", "The bridge with the fastest access port.", "Port speed does not determine root bridge election."],
    ["hostname", "The bridge with the alphabetically first hostname.", "Hostname is not part of the bridge ID election."],
    ["age", "The bridge that booted most recently.", "Uptime does not determine root selection."],
  ]),
  single("na-stp-s3", "spanning-tree", "What is the role of a non-root switch's root port?", "path", [
    ["path", "It is the port with the best path toward the root bridge.", "Correct: a non-root bridge selects one root port for its best root path."],
    ["designated", "It is always the port that forwards toward endpoint hosts only.", "An endpoint-facing port may be designated, but root port specifically points toward the root."],
    ["blocked", "It must always be a blocked port.", "The root port normally forwards toward the root."],
    ["gateway", "It provides the switch's default IP gateway.", "A spanning-tree root port is an L2 topology role, not an IP gateway."],
  ]),
  single("na-stp-s4", "spanning-tree", "What is a key characteristic of Rapid PVST+ compared with classic 802.1D STP?", "rapid", [
    ["rapid", "It provides a rapid spanning-tree instance per VLAN.", "Correct: Rapid PVST+ combines rapid convergence behavior with per-VLAN instances."],
    ["route", "It performs dynamic IP routing for each VLAN.", "Spanning tree prevents Layer 2 loops; it is not an IP routing protocol."],
    ["single", "It uses one shared spanning-tree instance for all VLANs only.", "Rapid PVST+ maintains a separate instance per VLAN."],
    ["disable", "It disables all redundant links permanently.", "STP blocks only selected paths as needed while retaining redundancy."],
  ]),
  multi("na-stp-m1", "spanning-tree", "Which two factors can influence spanning-tree root bridge election?", ["priority", "mac"], [
    ["priority", "Configured bridge priority.", "Correct: lower bridge priority is preferred in the bridge ID."],
    ["mac", "Bridge MAC address as a tie-breaker when priorities match.", "Correct: the lower MAC address wins a tie in the bridge ID."],
    ["hostname", "DNS hostname alphabetic order.", "Hostnames do not form part of the bridge ID."],
    ["ip", "Default gateway IP address.", "The gateway IP does not determine STP root election."],
  ]),
  multi("na-stp-m2", "spanning-tree", "Which two behaviors are associated with Spanning Tree?", ["block", "bpdu"], [
    ["block", "It can place a redundant path into a non-forwarding state to prevent a loop.", "Correct: blocking a redundant path creates a loop-free topology."],
    ["bpdu", "Switches exchange BPDUs to share spanning-tree information.", "Correct: BPDUs convey bridge and topology information."],
    ["route", "It chooses IP next hops using longest-prefix match.", "That is Layer 3 routing behavior."],
    ["translate", "It performs source NAT between VLANs.", "NAT is separate from spanning-tree operation."],
  ]),
  ordering("na-stp-o1", "spanning-tree", "Order the high-level steps used to form a spanning-tree topology.", ["elect", "select", "designate", "block"], [
    ["elect", "Elect the root bridge using bridge IDs.", "First: the topology needs a common root."],
    ["select", "Each non-root bridge selects its best root port.", "Second: each bridge identifies its best path toward the root."],
    ["designate", "Select a designated port for each segment.", "Third: the segment's best path toward the root is designated."],
    ["block", "Place remaining redundant paths in a non-forwarding role.", "Last: redundant paths are prevented from creating loops."],
  ]),
  simlet("na-stp-r1", "spanning-tree", "Read this illustrative per-VLAN output. Which two statements are accurate?", "Switch# show spanning-tree vlan 20\nRoot ID    Priority 24596\n           Address  0011.2233.4455\nBridge ID  Priority 28692\n           Address  00aa.bbcc.ddee\nInterface        Role Sts Cost      Prio.Nbr Type\nGi1/0/1          Root FWD 4         128.1    P2p\nGi1/0/2          Altn BLK 4         128.2    P2p", ["notroot", "rootport"], [
    ["notroot", "This switch is not the root bridge for VLAN 20.", "Correct: the Root ID address differs from the local Bridge ID address."],
    ["rootport", "Gi1/0/1 is the root port and is forwarding.", "Correct: its role is Root and state is FWD."],
    ["root", "This switch is the root bridge because the bridge priority is larger.", "Root ID identifies a different bridge; lower bridge ID is preferred."],
    ["forward", "Gi1/0/2 is forwarding as a designated port.", "Its role/state are Altn and BLK."],
  ]),

  // PortFast and BPDU Guard
  single("na-edge-s1", "edge-protection", "What does PortFast do on an appropriate endpoint-facing access port?", "forward", [
    ["forward", "Allows the port to transition to forwarding quickly without normal listening/learning delay.", "Correct: PortFast is designed to speed host-facing edge-port startup."],
    ["root", "Forces the port to become the spanning-tree root port.", "PortFast does not select the root port."],
    ["trunk", "Automatically converts an access port into a trunk.", "PortFast affects spanning-tree transition behavior, not VLAN mode."],
    ["route", "Enables Layer 3 routing on the switch port.", "PortFast is an STP edge feature, not a routed-port command."],
  ]),
  single("na-edge-s2", "edge-protection", "What should BPDU Guard do when an enabled protected edge port receives a BPDU?", "errdisable", [
    ["errdisable", "Place the port into an error-disabled state.", "Correct: BPDU Guard protects the edge by disabling the port upon BPDU reception."],
    ["root", "Elect the endpoint as the root bridge automatically.", "BPDU Guard does not elect a root; it protects the port."],
    ["trunk", "Silently change the port to a trunk.", "Receiving a BPDU does not cause automatic trunk conversion."],
    ["nat", "Translate the BPDU source address.", "BPDUs are Layer 2 control frames and are not translated by NAT."],
  ]),
  single("na-edge-s3", "edge-protection", "Where is PortFast most appropriately enabled?", "edge", [
    ["edge", "On ports connected to end hosts that are not expected to bridge BPDUs.", "Correct: PortFast is intended for edge-facing endpoint links."],
    ["switchlink", "On every inter-switch link regardless of design.", "Inter-switch links participate in spanning tree and should not be treated as ordinary host edges."],
    ["wan", "On an ISP-facing routed WAN interface.", "PortFast is an STP edge feature for switched ports, not a generic WAN setting."],
    ["root", "Only on the root bridge's root port.", "The root bridge has no root port, and PortFast is for edge ports."],
  ]),
  single("na-edge-s4", "edge-protection", "Why is BPDU Guard useful on a user access port with PortFast?", "unexpected", [
    ["unexpected", "It detects an unexpected switch or bridge sending BPDUs and shuts the edge port.", "Correct: this reduces risk from an accidental or unauthorized bridging device."],
    ["speed", "It increases the access-port data rate.", "BPDU Guard is a protection feature, not a speed control."],
    ["vlan", "It assigns a VLAN based on the received BPDU.", "BPDU Guard disables the port rather than assigning VLAN membership."],
    ["route", "It calculates the best IP route from the BPDU.", "BPDUs carry spanning-tree control information, not IP route calculations."],
  ]),
  multi("na-edge-m1", "edge-protection", "Which two statements describe safe use of PortFast and BPDU Guard?", ["host", "disable"], [
    ["host", "PortFast is suitable for a host-facing edge port.", "Correct: it minimizes startup delay for endpoint links."],
    ["disable", "BPDU Guard can disable that edge port if it receives a BPDU.", "Correct: this is the protection action on unexpected BPDU reception."],
    ["uplink", "PortFast should always be enabled on redundant switch uplinks.", "Switch uplinks normally participate in STP and should not blindly be treated as host edges."],
    ["ignore", "BPDU Guard ignores BPDUs so the port remains forwarding.", "Its purpose is to react to BPDUs by protecting the edge port."],
  ]),
  multi("na-edge-m2", "edge-protection", "Which two outcomes are expected when an endpoint-only PortFast/BPDU Guard port receives a BPDU?", ["portfast", "guard"], [
    ["portfast", "PortFast by itself speeds edge transition but does not replace loop prevention.", "Correct: it is a transition optimization, not an STP replacement."],
    ["guard", "With BPDU Guard enabled, BPDU reception can trigger error-disable protection.", "Correct: BPDU Guard shuts down the protected port."],
    ["routing", "The switch installs the BPDU sender as a static route.", "BPDUs are not routes and do not install static routing entries."],
    ["forward", "BPDU Guard guarantees the port remains forwarding after the BPDU.", "The expected protection action is to disable the port."],
  ]),
  ordering("na-edge-o1", "edge-protection", "Order the appropriate setup and verification steps for a protected endpoint edge port.", ["confirm", "configure", "connect", "verify"], [
    ["confirm", "Confirm the port is intended for an endpoint, not a switch/uplink.", "First: edge protections must be applied to the right port role."],
    ["configure", "Enable PortFast and BPDU Guard according to site policy.", "Second: configure the intended edge behavior and protection."],
    ["connect", "Attach the endpoint to the port.", "Third: connect the expected non-bridging endpoint."],
    ["verify", "Check operational state and logs for unexpected BPDU events.", "Last: verify normal forwarding and monitor protection events."],
  ]),
  simlet("na-edge-r1", "edge-protection", "Read this illustrative event and port status. Which two interpretations are correct?", "Switch# show logging | include BPDU\n%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi1/0/18\n%PM-4-ERR_DISABLE: bpduguard error detected on Gi1/0/18, putting Gi1/0/18 in err-disable state\nSwitch# show interfaces status | include Gi1/0/18\nGi1/0/18  printer  err-disabled  30  auto  auto  10/100/1000BaseTX", ["received", "disabled"], [
    ["received", "Gi1/0/18 received a BPDU while BPDU Guard protection was active.", "Correct: the log explicitly reports BPDU reception on that interface."],
    ["disabled", "The port was placed into an err-disabled state.", "Correct: both the log and status show err-disable/err-disabled."],
    ["normal", "The interface remains in normal forwarding state.", "The status is err-disabled, not connected/forwarding."],
    ["route", "A routing protocol shut the port after a route update.", "The message explicitly identifies BPDU Guard, not routing."],
  ]),

  // Wireless architectures and AP modes
  single("na-warch-s1", "wireless-architecture", "In a centralized WLAN design, what is a common role of the wireless LAN controller?", "manage", [
    ["manage", "Centralize AP configuration, policy, and client management.", "Correct: a WLC coordinates centrally managed APs and WLAN services."],
    ["route", "Replace every Ethernet switch in the campus.", "A WLC does not replace the wired switching infrastructure."],
    ["dns", "Resolve all client hostnames as its only role.", "DNS is a separate network service; controller roles are broader WLAN management."],
    ["cable", "Convert fiber into copper without any APs.", "A WLC manages WLAN infrastructure; it is not a media converter."],
  ]),
  single("na-warch-s2", "wireless-architecture", "Which AP mode is commonly used to serve wireless clients in a controller-managed WLAN?", "local", [
    ["local", "Local mode", "Correct: local mode is a common client-serving mode for centrally managed APs."],
    ["monitor", "Monitor mode", "Monitor mode primarily scans/monitors rather than serving client data."],
    ["sniffer", "Sniffer mode", "Sniffer mode captures wireless frames for analysis, not regular client access."],
    ["bridge", "Bridge mode only", "Bridge modes provide specific bridging functions and are not the generic controller-managed client mode."],
  ]),
  single("na-warch-s3", "wireless-architecture", "What is a key distinction between a lightweight AP and a standalone autonomous AP?", "controller", [
    ["controller", "A lightweight AP commonly relies on a controller for centralized management.", "Correct: lightweight APs typically obtain configuration and control from a WLC."],
    ["radio", "A lightweight AP has no radio hardware.", "Lightweight APs still contain radios to provide wireless access."],
    ["ethernet", "An autonomous AP cannot connect to Ethernet.", "Autonomous APs commonly connect to a wired Ethernet LAN."],
    ["ssid", "A standalone AP cannot advertise an SSID.", "An autonomous AP can advertise WLANs without a controller."],
  ]),
  single("na-warch-s4", "wireless-architecture", "Which AP mode is primarily intended to analyze the RF environment rather than provide regular client access?", "monitor", [
    ["monitor", "Monitor mode", "Correct: monitor mode scans for RF activity and rogue devices without normal client service."],
    ["local", "Local mode", "Local mode commonly serves client traffic."],
    ["flex", "FlexConnect local switching mode", "FlexConnect can support client access with local switching at remote sites."],
    ["bridge", "Bridge mode", "Bridge mode is used to bridge networks, not simply monitor the RF environment."],
  ]),
  multi("na-warch-m1", "wireless-architecture", "Which two responsibilities are commonly associated with a wireless LAN controller?", ["config", "roaming"], [
    ["config", "Centralized WLAN and AP configuration management.", "Correct: controllers can distribute WLAN policies to managed APs."],
    ["roaming", "Coordination or assistance for client mobility across managed APs.", "Correct: controller-based designs can support coordinated roaming."],
    ["physical", "Acting as the antenna for every AP in the building.", "APs contain the radios and antennas; a controller is not a shared antenna."],
    ["copper", "Replacing all access-layer Ethernet cabling.", "A WLC does not replace the wired AP uplinks."],
  ]),
  multi("na-warch-m2", "wireless-architecture", "Which two statements distinguish common AP deployment approaches?", ["autonomous", "controller-managed"], [
    ["autonomous", "An autonomous AP can be configured locally without a central controller.", "Correct: standalone management is performed on the AP itself."],
    ["controller-managed", "A lightweight AP commonly exchanges control information with a WLC.", "Correct: controller-managed APs communicate with their controller."],
    ["lightweight-no-service", "A lightweight AP cannot provide client service under any mode.", "Client-serving operation is a common lightweight AP function."],
    ["autonomous-requires-controller", "A standalone AP always requires a WLC for every configuration change.", "That contradicts its autonomous management approach."],
  ]),
  ordering("na-warch-o1", "wireless-architecture", "Order a simplified controller-managed AP startup toward serving a WLAN.", ["discover", "join", "download", "serve"], [
    ["discover", "AP obtains IP connectivity and discovers a controller.", "First: the AP needs network reachability and controller discovery."],
    ["join", "AP authenticates/joins the controller.", "Second: the controller accepts the AP into its managed state."],
    ["download", "AP receives its configuration and WLAN policy.", "Third: managed configuration is provisioned."],
    ["serve", "AP advertises the configured WLAN and handles client access.", "Last: the AP provides the service after configuration."],
  ]),
  simlet("na-warch-r1", "wireless-architecture", "Treat this as illustrative controller inventory. Which two conclusions are supported?", "WLC# show ap summary\nNumber of APs................................ 2\nName           IP Address      Status      AP Mode\nAP-East        192.0.2.41      Registered  Local\nAP-Conf        192.0.2.42      Registered  Monitor", ["east", "monitor"], [
    ["east", "AP-East is registered in Local mode.", "Correct: both Status and AP Mode columns show Registered and Local."],
    ["monitor", "AP-Conf is registered in Monitor mode.", "Correct: the row explicitly shows Registered and Monitor."],
    ["down", "Both APs are disconnected from the controller.", "Both are shown as Registered."],
    ["clients", "The output proves each AP currently has wireless clients.", "No client count or association data is shown."],
  ]),

  // Wireless physical connections
  single("na-wconn-s1", "wireless-connections", "An AP obtains power and network connectivity over one Ethernet cable from a compatible switch port. Which technology commonly provides the power?", "poe", [
    ["poe", "Power over Ethernet", "Correct: PoE can deliver electrical power and data over twisted-pair Ethernet."],
    ["lacp", "LACP", "LACP bundles links; it does not provide power."],
    ["lldp", "LLDP", "LLDP advertises neighbor information; it is not itself the power source."],
    ["stp", "Spanning Tree", "STP controls Layer 2 topology and does not power the AP."],
  ]),
  single("na-wconn-s2", "wireless-connections", "What must an AP's wired switch port provide for a centrally managed AP to reach its controller?", "ip", [
    ["ip", "Suitable Layer 2/Layer 3 connectivity, including IP reachability to the controller.", "Correct: control traffic requires a usable wired network path."],
    ["radio", "A second wireless client radio instead of Ethernet connectivity.", "The AP still needs wired infrastructure connectivity to reach the controller."],
    ["dns", "Only an SSID name with no IP configuration.", "An SSID does not provide AP management-plane network reachability."],
    ["stp", "A permanently blocked spanning-tree state.", "A blocked uplink would prevent the AP from reaching the controller."],
  ]),
  single("na-wconn-s3", "wireless-connections", "A switch port for an AP is configured as an access port in a management VLAN. What does that VLAN commonly carry?", "management", [
    ["management", "The AP's management/control connectivity on that link.", "Correct: the management VLAN can carry the AP's IP and controller communication."],
    ["rf", "The 2.4 GHz radio signal itself.", "Radio signals travel over the air, not inside an Ethernet VLAN."],
    ["power", "Only the electrical PoE current.", "PoE power is not a VLAN payload."],
    ["voice", "All voice traffic regardless of WLAN mapping.", "VLAN assignment depends on WLAN/client design; management VLAN does not automatically carry all voice traffic."],
  ]),
  single("na-wconn-s4", "wireless-connections", "If a wireless client is associated but receives no usable network access, which wired-path component is a useful check?", "uplink", [
    ["uplink", "The AP's switch-port state and VLAN connectivity.", "Correct: the AP wired uplink must carry the needed management and client VLAN traffic."],
    ["ssid", "Only capitalization of the client's computer name.", "Computer-name capitalization does not correct wired VLAN forwarding."],
    ["dnsname", "The DNS suffix of the switch hostname.", "The switch's hostname suffix does not establish client network access."],
    ["console", "The AP's console cable length.", "Console cabling is unrelated to the AP's normal data path."],
  ]),
  multi("na-wconn-m1", "wireless-connections", "Which two items are relevant to an AP's physical wired connection?", ["poe", "vlan"], [
    ["poe", "Whether the switch port can provide sufficient PoE for the AP model.", "Correct: the AP may depend on a compatible power budget and standard."],
    ["vlan", "Whether the switch port carries the AP management/client VLANs required by design.", "Correct: VLAN connectivity supports AP management and user traffic."],
    ["ssid", "Whether the patch cable advertises the SSID.", "SSID advertisement is an AP radio function, not a cable function."],
    ["dns", "Whether the Ethernet cable resolves client hostnames.", "DNS is a network service and is not performed by the physical cable."],
  ]),
  multi("na-wconn-m2", "wireless-connections", "Which two checks can help diagnose an AP that is powered but not joining its controller?", ["address", "path"], [
    ["address", "Check that the AP has a valid address, mask, and gateway.", "Correct: a valid management IP configuration is needed for controller reachability."],
    ["path", "Verify the wired VLAN/routing path and controller reachability.", "Correct: the AP must reach the controller across the network."],
    ["ssid", "Change the client SSID without checking AP management connectivity.", "Client WLAN names do not fix AP-to-controller reachability."],
    ["duplex", "Change the controller's client password to repair the AP uplink.", "Client authentication credentials are separate from AP wired link operation."],
  ]),
  ordering("na-wconn-o1", "wireless-connections", "Order the wired and wireless path from controller-managed AP startup to client data access.", ["switch", "controller", "wlan", "client"], [
    ["switch", "AP connects to a powered switch port with appropriate VLAN/IP reachability.", "First: the AP needs an operational wired connection."],
    ["controller", "AP reaches and joins its controller.", "Second: management/control connectivity establishes."],
    ["wlan", "AP advertises the configured WLAN and maps it to network policy.", "Third: wireless service is made available."],
    ["client", "Client associates and sends traffic through the AP into the wired network.", "Last: the client uses the configured service."],
  ]),
  simlet("na-wconn-r1", "wireless-connections", "Read this illustrative switch port summary. Which two conclusions are supported?", "Switch# show interfaces status\nPort      Name       Status     Vlan  Duplex Speed  Type\nGi1/0/12  AP-east    connected  99    full   1000   10/100/1000BaseTX\nGi1/0/13  AP-west    notconnect 99    auto   auto   10/100/1000BaseTX\nSwitch# show power inline\nGi1/0/12  AP-east    on   15.4 W\nGi1/0/13  AP-west    off  0.0 W", ["east", "west"], [
    ["east", "AP-east's switch link is connected and PoE is on at 15.4 W.", "Correct: both summaries show an active link and power draw."],
    ["west", "AP-west's port has no link and PoE is off.", "Correct: its status is notconnect and power is off."],
    ["same", "Both AP switch ports are connected and powered.", "AP-west is not connected and has no power output."],
    ["radio", "The output proves AP-east is advertising an SSID.", "Port and power data do not show WLAN radio/SSID state."],
  ]),

  // WLAN configuration and security
  single("na-wsec-s1", "wlan-security", "Which WLAN component is the human-readable network name that clients select?", "ssid", [
    ["ssid", "SSID", "Correct: the SSID identifies the wireless network to users and clients."],
    ["vlan", "VLAN ID", "A VLAN ID maps traffic to a wired segment but is not typically the displayed WLAN name."],
    ["bssid", "BSSID", "A BSSID identifies a particular AP radio/basic service set, not the general network name."],
    ["psk", "Pre-shared key", "The PSK is an authentication secret, not the WLAN name."],
  ]),
  single("na-wsec-s2", "wlan-security", "Which setting maps a WLAN's client traffic to the intended wired network segment?", "vlan", [
    ["vlan", "WLAN-to-VLAN mapping", "Correct: the WLAN policy maps client traffic into a VLAN."],
    ["ssid", "SSID capitalization only", "The SSID name does not by itself determine the wired VLAN mapping."],
    ["channel", "Radio channel", "Channel selection affects RF operation, not VLAN assignment."],
    ["rssi", "Received signal level", "Signal level is a radio measurement and does not map traffic to a VLAN."],
  ]),
  single("na-wsec-s3", "wlan-security", "Which choice provides stronger personal WLAN security than an open SSID with no authentication?", "wpa2", [
    ["wpa2", "WPA2-Personal with a strong pre-shared key", "Correct: WPA2-Personal authenticates with a PSK and encrypts wireless traffic."],
    ["open", "Open authentication with hidden SSID", "Hiding a network name does not provide meaningful authentication or encryption."],
    ["wep", "WEP with a short shared key", "WEP is obsolete and vulnerable; it is not a strong modern choice."],
    ["mac", "MAC filtering alone", "MAC addresses can be observed/spoofed and filtering alone is not encryption."],
  ]),
  single("na-wsec-s4", "wlan-security", "What is the purpose of 802.1X authentication in an enterprise WLAN?", "identity", [
    ["identity", "Authenticate users/devices through an authentication server such as RADIUS.", "Correct: 802.1X provides port-based access control and enterprise credential validation."],
    ["channel", "Choose the least congested RF channel.", "Channel selection is a radio-planning function, not 802.1X authentication."],
    ["nat", "Translate a client's private IP address to a public one.", "NAT is an IP edge function, not WLAN authentication."],
    ["ssid", "Encrypt the SSID name before it is broadcast.", "802.1X authenticates access; SSID advertisement itself is not the protected payload."],
  ]),
  multi("na-wsec-m1", "wlan-security", "Which two elements are normally part of defining a usable WLAN?", ["ssid", "mapping"], [
    ["ssid", "An SSID/network name for client selection.", "Correct: clients use the SSID to identify the WLAN."],
    ["mapping", "A VLAN or policy mapping for client traffic.", "Correct: WLAN traffic must be associated with the intended wired/network policy."],
    ["serial", "A serial console password as the only client authentication method.", "Console access is unrelated to wireless client association."],
    ["stp", "A spanning-tree root address embedded in the SSID.", "The SSID does not encode STP root information."],
  ]),
  multi("na-wsec-m2", "wlan-security", "Which two practices improve WLAN access security?", ["strong", "enterprise"], [
    ["strong", "Use a strong, non-reused passphrase for a personal WLAN.", "Correct: unpredictable credentials reduce guessing risk."],
    ["enterprise", "Use enterprise authentication with unique user/device credentials where appropriate.", "Correct: 802.1X/RADIUS can provide identity-based access and accountability."],
    ["hidden", "Rely only on suppressing SSID broadcast as authentication.", "SSID hiding is not a substitute for authentication or encryption."],
    ["wep", "Enable WEP to protect sensitive modern business traffic.", "WEP is obsolete and cryptographically weak."],
  ]),
  ordering("na-wsec-o1", "wlan-security", "Order a basic secure WLAN rollout from network planning to client validation.", ["segment", "identity", "configure", "test"], [
    ["segment", "Choose the intended client VLAN/network policy.", "First: decide where client traffic belongs."],
    ["identity", "Select the authentication and encryption method.", "Second: define how clients will authenticate and protect traffic."],
    ["configure", "Configure the SSID, mapping, and security settings.", "Third: implement the WLAN policy on the infrastructure."],
    ["test", "Join a test client and verify authentication and expected reachability.", "Last: validate both wireless access and resulting network access."],
  ]),
  simlet("na-wsec-r1", "wlan-security", "Read this illustrative WLAN profile. Which two statements are correct?", "WLC# show wlan summary\nID  Profile Name  SSID          Status\n7   Staff         NorthOffice   Enabled\nWLC# show wlan 7\nSecurity: WPA2-PSK\nVLAN: 30\nBroadcast SSID: Enabled", ["enabled", "secure"], [
    ["enabled", "The NorthOffice SSID is enabled and broadcast.", "Correct: the summary says Enabled and profile says Broadcast SSID: Enabled."],
    ["secure", "The profile uses WPA2-PSK and maps traffic to VLAN 30.", "Correct: both settings are explicitly displayed."],
    ["open", "The WLAN uses open authentication with no configured security.", "The output explicitly specifies WPA2-PSK."],
    ["vlan7", "Client traffic is mapped to VLAN 7 because WLAN ID is 7.", "The WLAN ID is 7, but the configured client VLAN is 30."],
  ]),
];
