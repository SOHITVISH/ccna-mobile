import type { Domain } from "./curriculum";
import type { LessonContent } from "./lessonContent";
import type { QuizQuestion } from "./quizBank";

type LessonSeed = {
  objective: string;
  example: string;
  deepDive: [string, string, string];
  lab: {
    title: string;
    scenario: string;
    steps: [string, string, string];
    check: string;
    choices: [string, string, string, string];
    explanation: string;
    command: string;
  };
  quiz: QuizQuestion;
};

const seeds: Record<string, LessonSeed> = {
  "enterprise-architecture": {
    objective: "Translate business availability, scale, and security requirements into a modular enterprise design.",
    example: "A campus with 3,000 users uses redundant distribution pairs, routed core links, and summarized site routes so a single access switch failure stays local.",
    deepDive: [
      "Start with requirements and failure domains: user count, application flows, latency, growth, change windows, and recovery objectives. Draw both physical paths and logical boundaries; a redundant drawing is not resilient if both paths share one power, fiber, or control-plane failure.",
      "A hierarchical campus separates access, distribution, and core roles. A two-tier collapsed core fits smaller sites; a three-tier design separates fast transport from policy aggregation at larger scale. Choose routed access or Layer 2 access deliberately because it changes where gateways, spanning tree, and fault containment live.",
      "Use modular blocks, consistent addressing, route summarization, redundant first hops, and tested failure scenarios. Document the normal path and what converges after a link, device, or site loss; availability is an observed service outcome, not simply the number of boxes."
    ],
    lab: {
      title: "Design a resilient campus block",
      scenario: "A campus needs two distribution switches, access-layer redundancy, and a routed core with predictable failure boundaries.",
      steps: ["Mark access, distribution, and core roles; identify the default-gateway location.", "Choose where Layer 2 ends and where routing and summarization occur.", "Simulate a distribution or uplink failure and state which users and services remain reachable."],
      check: "Which design choice most directly contains a Layer 2 loop and broadcast failure?",
      choices: ["Extend one VLAN across every building", "Use routed links between distribution and core and keep VLANs local", "Disable all redundant links", "Place every switch in one spanning-tree domain"],
      explanation: "Routed inter-layer links and local VLAN boundaries constrain Layer 2 failure scope while retaining multiple Layer 3 paths.",
      command: "show ip route\nshow spanning-tree root"
    },
    quiz: { prompt: "A campus wants faults isolated and routing convergence predictable. Which principle best supports that goal?", choices: ["Extend every VLAN end to end", "Use modular layers with deliberate Layer 2 boundaries", "Rely on a single central switch", "Avoid documenting failure paths"], answer: 1, explanation: "Modular layers and explicit Layer 2 boundaries reduce failure scope and make routing behavior easier to reason about." }
  },
  "campus-fabric": {
    objective: "Explain SD-Access fabric roles and distinguish the underlay from the overlay.",
    example: "An access edge authenticates a laptop, the fabric control plane maps its identity and location, and a border node connects it to a traditional data center.",
    deepDive: [
      "The underlay is the routed IP transport between fabric nodes; it must provide stable reachability before any overlay works. The overlay carries endpoint identity and segmentation across that transport, so an underlay adjacency problem and an overlay policy problem require different evidence.",
      "Common roles include fabric edge for endpoint attachment, control plane for endpoint-to-location mapping, border for external networks, and a centralized management/controller plane for provisioning and assurance. A node may combine roles in smaller deployments, subject to platform and scale limits.",
      "Treat identity, virtual network/segment, IP pools, border handoff, and policy as one design. Stage fabric changes in a lab, check software and hardware support, and verify endpoint onboarding, roaming, external reachability, and failure behavior before broad rollout."
    ],
    lab: {
      title: "Trace a fabric endpoint",
      scenario: "A user authenticates successfully at a fabric edge but cannot reach an application outside the fabric.",
      steps: ["Verify the edge-to-underlay reachability and control-plane registration.", "Confirm endpoint identity, virtual network, and assigned policy.", "Inspect the border handoff and test the destination route and return path."],
      check: "What should be verified before troubleshooting an overlay endpoint mapping?",
      choices: ["Only the user's DNS cache", "Routed underlay reachability between fabric nodes", "Spanning tree across the overlay", "A public NAT translation on every edge"],
      explanation: "The overlay depends on a functioning routed underlay; verify transport reachability before interpreting endpoint-mapping or policy symptoms.",
      command: "show ip route\nshow lisp session\nshow lisp instance-id"
    },
    quiz: { prompt: "In a fabric design, what provides IP transport between overlay nodes?", choices: ["The overlay policy", "The routed underlay", "The endpoint VLAN alone", "A DHCP reservation"], answer: 1, explanation: "The underlay provides routed IP reachability; the overlay carries endpoint and segmentation abstractions over it." }
  },
  "sdwan-architecture": {
    objective: "Describe SD-WAN control, management, orchestration, and data-plane roles.",
    example: "A branch uses an internet circuit and MPLS; centralized policy selects the internet path for SaaS and the private path for a latency-sensitive internal application.",
    deepDive: [
      "SD-WAN separates centralized management and policy from distributed packet forwarding. Depending on the product architecture, orchestration/onboarding, control-plane route distribution, management, and data-plane tunnel functions are distinct roles; do not confuse a controller with the device that forwards each packet.",
      "An overlay is built across one or more underlay transports such as broadband, cellular, or private WAN. Application-aware policy can select paths using reachability and measured loss, latency, or jitter, while segmentation keeps traffic classes apart.",
      "A sound rollout validates certificates and onboarding, underlay reachability, control connections, route exchange, segmentation, application policy, and local internet breakout. Keep a tested fallback because a centralized policy mistake can affect many sites at once."
    ],
    lab: {
      title: "Select a branch transport",
      scenario: "Voice must prefer a stable low-jitter path; bulk backups may use cheaper broadband when healthy.",
      steps: ["Check each transport's reachability and measured loss, latency, and jitter.", "Map application classes to a primary path and an explicit fallback.", "Test failover and confirm segmentation and return routing remain correct."],
      check: "Which signal is most useful for an application-aware voice path decision?",
      choices: ["The branch hostname", "Measured path loss, latency, and jitter", "The number of local VLANs", "The DHCP lease duration"],
      explanation: "Application-aware policy uses path quality metrics such as loss, latency, and jitter, together with defined policy and fallback.",
      command: "show sdwan control connections\nshow sdwan omp routes"
    },
    quiz: { prompt: "What does an SD-WAN control plane primarily distribute?", choices: ["Ethernet collisions", "Reachability and policy information for overlay paths", "User application binaries", "DHCP broadcasts across all sites"], answer: 1, explanation: "The control plane distributes overlay reachability and policy; forwarding remains on the edge data plane." }
  },
  "cloud-connectivity": {
    objective: "Compare private, public-internet, and overlay connectivity to cloud workloads.",
    example: "A company uses redundant private cloud interconnects for core services and an encrypted internet VPN as a tested backup.",
    deepDive: [
      "Cloud network design begins with prefixes, regions, route domains, security controls, bandwidth, and latency requirements. Private interconnects, IPsec VPNs, and SD-WAN overlays provide different cost, performance, and operational trade-offs.",
      "Cloud route tables, transit hubs, virtual network peering, on-premises routing, and security groups must agree in both directions. Overlapping address space, asymmetric paths, and accidental route propagation are frequent causes of partial connectivity.",
      "Test failure of each circuit and gateway, confirm advertised prefixes and return routes, and monitor tunnel health and throughput. Use provider documentation for limits and supported architectures because service capabilities change over time."
    ],
    lab: {
      title: "Validate a hybrid-cloud path",
      scenario: "A cloud workload reaches on-premises services only when initiated from the cloud.",
      steps: ["Compare cloud and on-premises route tables for the workload and service prefixes.", "Check the VPN or private-circuit state, security policy, and any overlapping prefixes.", "Test the reverse path and simulate loss of the primary connection."],
      check: "What commonly causes a connection to work in only one direction?",
      choices: ["A correct return route", "A missing or asymmetric return route or stateful policy", "A matching MTU", "A functioning DNS record"],
      explanation: "Bidirectional traffic needs a valid return path and compatible stateful security policy at both ends.",
      command: "show ip route\nshow crypto isakmp sa\nshow crypto ipsec sa"
    },
    quiz: { prompt: "A cloud workload initiates successfully, but replies never arrive. What should be checked first?", choices: ["Only the source hostname", "Return routing and stateful security policy", "The switch access VLAN name", "The NTP stratum"], answer: 1, explanation: "Cloud and on-premises routing plus stateful policy must allow the return path; verify both directions." }
  },
  "vrf-lite": {
    objective: "Build isolated routing tables on shared router or Layer 3 switch infrastructure.",
    example: "Two tenants both use 10.20.0.0/16 but remain isolated because their interfaces and routes belong to separate VRFs.",
    deepDive: [
      "A VRF creates a separate Layer 3 forwarding and routing-table context on one device. Interfaces assigned to a VRF use that VRF's routes rather than the global table; identical prefixes can coexist in different VRFs.",
      "VRFs do not automatically provide communication between tenants or internet access. Inter-VRF routing requires an intentional design such as a firewall, route leaking, or a shared-services VRF, with explicit policy and return paths.",
      "Verify interface-to-VRF assignment, per-VRF connected and learned routes, and the intended isolation boundary. Moving a live interface into a VRF can remove its global-table addressing and reachability, so plan the migration and rollback."
    ],
    lab: {
      title: "Separate two overlapping tenants",
      scenario: "Tenant A and Tenant B both use 10.20.1.0/24 and must not communicate.",
      steps: ["Create two VRF contexts and assign one routed interface to each.", "Address each interface and verify routes in the corresponding VRF table.", "Attempt cross-tenant reachability and confirm it fails without an approved leak."],
      check: "Can two VRFs contain the same IPv4 prefix?",
      choices: ["No, prefixes must be globally unique", "Yes, each VRF has an independent routing table", "Only if both use NAT", "Only on a firewall"],
      explanation: "Separate VRF routing tables allow the same prefix to exist independently; communication requires an explicit inter-VRF design.",
      command: "vrf definition TENANT-A\n address-family ipv4\n exit-address-family\ninterface GigabitEthernet0/0\n vrf forwarding TENANT-A\n ip address 10.20.1.1 255.255.255.0"
    },
    quiz: { prompt: "What is the primary function of VRF-Lite?", choices: ["Encrypt all device traffic", "Maintain separate Layer 3 routing tables on shared equipment", "Bundle Ethernet links", "Prevent Layer 2 loops"], answer: 1, explanation: "VRF-Lite separates routing and forwarding contexts without requiring MPLS in the provider core." }
  },
  "gre-tunnels": {
    objective: "Explain GRE encapsulation, its lack of encryption, and tunnel reachability requirements.",
    example: "A GRE tunnel carries multicast routing packets between two branch routers across an IP-only provider network; IPsec is added when confidentiality is required.",
    deepDive: [
      "GRE encapsulates an inner packet inside an outer IP packet, creating a logical point-to-point tunnel across a routed underlay. It can carry protocols and multicast traffic that a plain IP path may not support directly.",
      "GRE itself does not encrypt, authenticate, or protect against replay. If the transport is untrusted, pair GRE with IPsec or choose a secure overlay; account for added headers and reduced effective MTU.",
      "The tunnel source and destination must be reachable through the underlay independently of the tunnel. Verify outer routing first, then tunnel line protocol, inner addressing, routing neighbors, MTU, and packet fragmentation."
    ],
    lab: {
      title: "Bring up a GRE overlay",
      scenario: "Two routers have working public underlay reachability but need to exchange OSPF across a logical link.",
      steps: ["Confirm each tunnel destination is reachable using the physical underlay route.", "Configure matching tunnel endpoints and unique inner tunnel addresses.", "Verify line protocol, OSPF adjacency, MTU, and whether encryption is additionally required."],
      check: "Does GRE by itself encrypt the encapsulated traffic?",
      choices: ["Yes, using AES by default", "No; add IPsec or another secure transport when confidentiality is needed", "Only for multicast", "Only when the tunnel MTU is 1500"],
      explanation: "GRE provides encapsulation, not cryptographic protection. Use IPsec where confidentiality and integrity are required.",
      command: "interface Tunnel10\n ip address 10.255.10.1 255.255.255.252\n tunnel source GigabitEthernet0/0\n tunnel destination 198.51.100.2"
    },
    quiz: { prompt: "A GRE tunnel is up over the public internet. What additional feature is needed for confidentiality?", choices: ["PortFast", "IPsec encryption", "A larger OSPF area ID", "A DHCP relay"], answer: 1, explanation: "GRE encapsulates traffic but does not encrypt it. IPsec can protect the tunnel across an untrusted transport." }
  },
  "vxlan-overlay": {
    objective: "Describe VXLAN VNI segmentation and the role of a Layer 3 underlay and VTEPs.",
    example: "A data-center VLAN maps to VNI 10100; two VTEPs encapsulate tenant frames in UDP/IP so workloads can span racks without extending one physical VLAN.",
    deepDive: [
      "VXLAN carries Layer 2 frames over a Layer 3 IP fabric using UDP encapsulation. A VXLAN Network Identifier (VNI) identifies an overlay segment and offers far more segment IDs than the 12-bit VLAN field.",
      "A VTEP performs encapsulation and decapsulation at the edge. The underlay routes between VTEP loopbacks; the overlay control plane or data-plane learning provides endpoint-to-VTEP reachability. A broken underlay cannot be repaired by changing the VNI.",
      "Design MTU for the additional headers, map VLANs to VNIs consistently, and control unknown unicast and broadcast replication. Validate VTEP reachability, MAC/IP learning, and tenant isolation before troubleshooting applications."
    ],
    lab: {
      title: "Trace a VXLAN endpoint",
      scenario: "A host on one leaf cannot reach a same-segment host on another leaf.",
      steps: ["Test routed reachability between the two VTEP loopback addresses.", "Confirm both access VLANs map to the same VNI and the endpoint is learned.", "Check encapsulation MTU and the overlay control-plane or replication state."],
      check: "What does the VNI identify?",
      choices: ["A physical switch port", "A logical VXLAN overlay segment", "An OSPF process", "A BGP router ID"],
      explanation: "The VNI identifies an overlay segment; the underlay provides routed reachability between VTEPs.",
      command: "show nve peers\nshow nve vni\nshow mac address-table"
    },
    quiz: { prompt: "Which addresses must be IP-reachable for VXLAN tunnel endpoints to exchange encapsulated traffic?", choices: ["Client DNS addresses", "VTEP underlay addresses", "VLAN IDs only", "DHCP server addresses only"], answer: 1, explanation: "The underlay must route between VTEP addresses before the VXLAN overlay can carry traffic." }
  },
  "hypervisor-networking": {
    objective: "Trace virtual-machine traffic through virtual switches, uplinks, and physical switching.",
    example: "A VM with a tagged port group sends through a host vSwitch and a trunk uplink carrying VLAN 120 to the physical access switch.",
    deepDive: [
      "A hypervisor virtual switch connects virtual NICs to one another and to physical uplinks. Port groups or equivalent virtual network objects define policies such as VLAN tagging, security, and traffic shaping.",
      "The physical switch port must match the host's tagging model: an access/native VLAN for untagged host traffic or a trunk for tagged guest VLANs. A mismatch can cause one VM network to fail while host management remains reachable.",
      "For a VM connectivity fault, follow the frame from guest IP and virtual NIC through port group, vSwitch, physical NIC, switchport/VLAN, and gateway. Check teaming, MTU, and security policies at each boundary."
    ],
    lab: {
      title: "Restore VM network access",
      scenario: "A VM on VLAN 120 has no gateway reachability, while the hypervisor management network works.",
      steps: ["Check the VM vNIC and port-group VLAN assignment.", "Verify the host uplink and physical switch trunk both carry VLAN 120.", "Inspect gateway ARP/MAC learning and test the path hop by hop."],
      check: "What must agree for a VLAN-tagged VM to reach its gateway?",
      choices: ["Only the VM hostname", "Guest port group, host uplink, and physical switch VLAN handling", "The hypervisor NTP server", "The switch serial number"],
      explanation: "The VLAN must be carried consistently through the virtual port group, physical NIC, and switch trunk to the gateway.",
      command: "show interfaces trunk\nshow vlan brief\nshow mac address-table vlan 120"
    },
    quiz: { prompt: "A tagged VM network fails while host management works. Which boundary is a high-value first check?", choices: ["The VM's DNS suffix only", "VLAN mapping and trunk allowance from port group to switch", "The router's NTP source", "The user's desktop cable"], answer: 1, explanation: "Host management may use a separate VLAN; verify the guest VLAN mapping across the complete virtual-to-physical path." }
  },
  "advanced-vlan-trunking": {
    objective: "Configure VLAN trunks safely and reason about allowed VLANs and native VLAN behavior.",
    example: "An access switch carries only VLANs 10, 20, and 99 to distribution, with an unused native VLAN and matching settings at both ends.",
    deepDive: [
      "An 802.1Q trunk tags frames so multiple VLANs share a link. The allowed VLAN list limits which broadcast domains cross it; pruning unused VLANs reduces exposure and avoids unintended Layer 2 extension.",
      "Native VLAN behavior concerns untagged traffic and must match across both ends. A mismatch can create leakage or confusing spanning-tree warnings. Native VLAN is not a substitute for an explicit management or security design.",
      "Before a change, inspect operational trunk state, native VLAN, allowed and active VLANs, and spanning-tree status at both endpoints. Preserve a management path and verify only the intended VLANs pass after applying changes."
    ],
    lab: {
      title: "Harden an access uplink",
      scenario: "An uplink should carry VLANs 10, 20, and 99 only; both ends must agree on native VLAN 999.",
      steps: ["Inspect trunk state and compare allowed/native VLAN settings at both ends.", "Configure trunk mode, the restricted VLAN list, and matching native VLAN.", "Verify VLANs 10/20/99 are active and unexpected VLANs are absent."],
      check: "What is the safest approach to unused VLANs on a trunk?",
      choices: ["Allow every VLAN by default", "Explicitly allow only required VLANs and verify both ends", "Change only one end's native VLAN", "Disable spanning tree globally"],
      explanation: "An explicit allowed list limits VLAN exposure; native and allowed settings should be checked at both ends.",
      command: "interface GigabitEthernet1/0/48\n switchport mode trunk\n switchport trunk native vlan 999\n switchport trunk allowed vlan 10,20,99"
    },
    quiz: { prompt: "Why restrict the allowed VLAN list on an 802.1Q trunk?", choices: ["To turn it into a routed port", "To limit VLANs crossing the link to those required", "To encrypt frames", "To disable MAC learning"], answer: 1, explanation: "A restricted list reduces unnecessary Layer 2 extension and helps enforce the intended segmentation boundary." }
  },
  "spanning-tree-tuning": {
    objective: "Predict STP root and port roles and apply safe edge and root protections.",
    example: "Two distribution switches use explicit root primary/secondary priorities; access ports use edge behavior with BPDU Guard while uplinks remain normal STP ports.",
    deepDive: [
      "Spanning Tree selects a root bridge using the lowest bridge ID, then selects root, designated, and alternate roles using path cost and tie-breakers. The root is a design choice: place it where traffic patterns and failure behavior make sense.",
      "Rapid PVST+ runs a spanning-tree instance per VLAN; MST maps VLANs into a smaller number of instances. Convergence and scale depend on consistent region parameters, compatible links, and carefully chosen root placement.",
      "Use PortFast/edge mode only on true endpoint-facing ports and pair it with BPDU Guard. Root Guard or Loop Guard solve different problems; understand each failure mode, inspect blocked ports, and avoid global protections that hide topology mistakes."
    ],
    lab: {
      title: "Stabilize the spanning-tree root",
      scenario: "An access switch unexpectedly became root after a maintenance event.",
      steps: ["Inspect root ID, local bridge ID, port roles, and topology-change counters.", "Set intended primary and secondary root priorities on distribution switches.", "Enable edge protection only on endpoint ports and retest a redundant link failure."],
      check: "Which STP value determines root bridge election?",
      choices: ["The highest interface bandwidth alone", "The lowest bridge ID (priority plus MAC tie-break)", "The longest hostname", "The number of VLANs"],
      explanation: "Root election uses the lowest bridge ID; explicit priority planning makes the result predictable.",
      command: "show spanning-tree vlan 10\nspanning-tree vlan 10 root primary"
    },
    quiz: { prompt: "How is the STP root bridge elected?", choices: ["Highest IP address wins", "Lowest bridge ID wins", "First switch powered on always wins", "The switch with most ports wins"], answer: 1, explanation: "Bridge ID comparison (priority, then MAC address) determines the root; configure priority intentionally." }
  },
  "etherchannel-lacp": {
    objective: "Build and troubleshoot LACP port channels with consistent member settings.",
    example: "Two 10-Gb/s links form one LACP bundle; the logical channel offers aggregate capacity across flows and survives one member failure.",
    deepDive: [
      "LACP negotiates aggregation using active/passive modes and system/port identifiers. Both ends must have compatible speed, duplex, VLAN/trunk or routed mode, native VLAN, and other relevant parameters.",
      "The port-channel is the logical interface used by spanning tree and Layer 3 protocols. Traffic is typically distributed per flow using a hash; one flow usually does not consume the sum of all member bandwidth.",
      "Check both bundle summary and member state. A suspended or individual member often indicates a configuration mismatch; correct the cause and verify the bundle remains up after removing one physical member."
    ],
    lab: {
      title: "Form a resilient LACP uplink",
      scenario: "Two switches have two parallel physical links that should operate as one trunk.",
      steps: ["Match trunk mode, native VLAN, allowed VLANs, and channel-group settings on both ends.", "Negotiate the bundle with LACP active/passive and inspect member state.", "Disconnect one member in the simulation and confirm the logical channel remains up."],
      check: "What normally happens to a single flow across a two-link port-channel?",
      choices: ["It is always split evenly packet by packet", "A hash generally selects a member; aggregate bandwidth is available across flows", "It is encrypted across both links", "It becomes two separate spanning-tree roots"],
      explanation: "Load distribution commonly hashes flow attributes to a member, so aggregate capacity is realized across multiple flows.",
      command: "interface range GigabitEthernet1/0/47-48\n channel-group 10 mode active\ninterface Port-channel10\n switchport mode trunk"
    },
    quiz: { prompt: "A LACP member is suspended. What should be compared first?", choices: ["DNS records", "Member and peer interface settings for compatibility", "NTP stratum", "The router ID"], answer: 1, explanation: "Speed, duplex, VLAN/trunk or routed mode, and channel-group state must be compatible at both ends." }
  },
  "ospf-design": {
    objective: "Design OSPF adjacencies, areas, router IDs, and route summarization for an enterprise.",
    example: "A branch uses area 20 and advertises a summarized /20 into area 0 through its ABR, reducing core route churn.",
    deepDive: [
      "OSPF routers discover neighbors using Hello packets, agree on key interface parameters, elect DR/BDR on multiaccess segments, and exchange link-state information. Matching area, timers, network type, authentication, and MTU are common adjacency prerequisites.",
      "A stable router ID identifies the OSPF process and should be planned rather than left to an interface address that may change. Area design limits link-state flooding and SPF scope; area 0 is the backbone and non-backbone areas connect through it (directly or via virtual-link exceptions).",
      "Summarize at ABRs or ASBRs only when addressing is contiguous and failure behavior is understood. Validate neighbor state, LSDB, route type, cost, and forwarding path; an OSPF route in the table does not prove the application return path works."
    ],
    lab: {
      title: "Bring up a branch OSPF neighbor",
      scenario: "A branch router's OSPF interface is up but no neighbor forms with distribution.",
      steps: ["Compare area, timers, authentication, network type, MTU, and subnet on both ends.", "Verify router IDs and the interface is participating in the intended process/area.", "Inspect neighbor state, LSDB entries, and the installed route after adjacency forms."],
      check: "Which parameters commonly must agree for an OSPF adjacency on a link?",
      choices: ["Only hostnames", "Area and compatible interface-level OSPF settings", "Only DNS suffixes", "Only the default gateway"],
      explanation: "Area and interface parameters such as timers, authentication, network type, and MTU must be compatible.",
      command: "router ospf 10\n router-id 10.10.10.10\n network 10.10.10.0 0.0.0.255 area 0\nshow ip ospf neighbor"
    },
    quiz: { prompt: "Two OSPF routers share a subnet but do not become neighbors. Which is a high-value check?", choices: ["Switch hostname capitalization", "Area and interface-level OSPF parameter compatibility", "The syslog collector's timezone", "The default DNS search suffix"], answer: 1, explanation: "Check area, timers, authentication, network type, subnet, and MTU before investigating higher-level routing." }
  },
  "fhrp-gateway-redundancy": {
    objective: "Design and troubleshoot resilient first-hop gateways using HSRP, VRRP, or GLBP concepts.",
    example: "Two distribution switches share a virtual gateway; the active device forwards for the VLAN and a standby takes over after a tracked uplink failure.",
    deepDive: [
      "First-hop redundancy gives hosts a stable virtual default-gateway address while multiple routers or Layer 3 switches provide forwarding. HSRP, standards-based VRRP, and GLBP differ in interoperability and load-sharing behavior.",
      "Priority, preemption, hello/hold timers, authentication support, interface tracking, and object tracking influence active/standby roles. Track an upstream dependency when a live access interface no longer represents useful end-to-end reachability.",
      "Verify group state, virtual IP/MAC, active and standby devices, timers, and tracked objects. Test device and upstream-link failure, ARP/ND refresh, and restoration behavior; avoid dual-active states and unnecessary role flaps."
    ],
    lab: {
      title: "Fail over a redundant gateway",
      scenario: "A VLAN's active gateway remains up after its upstream routed link fails.",
      steps: ["Inspect HSRP/VRRP group role, priority, preemption, and tracked objects.", "Track the relevant uplink or SLA so loss of upstream service changes gateway eligibility.", "Fail the uplink in the lab and verify host gateway reachability and stable role recovery."],
      check: "Why track an upstream path instead of only the gateway interface?",
      choices: ["To increase the subnet size", "A gateway can be locally up while its upstream service path has failed", "To avoid using a virtual IP", "To disable routing"],
      explanation: "Tracking an upstream link or service probe can trigger failover when local interfaces remain up but useful reachability is lost.",
      command: "show standby brief\nshow track"
    },
    quiz: { prompt: "A default-gateway interface is up but its upstream link is down. What improves FHRP behavior?", choices: ["Disable the virtual IP", "Track the upstream dependency and adjust gateway priority/state", "Increase the VLAN number", "Turn off ARP"], answer: 1, explanation: "Tracking upstream dependencies prevents an otherwise-active gateway from black-holing traffic." }
  },
  "bfd-fast-failover": {
    objective: "Explain BFD session detection and how routing protocols use fast failure signals.",
    example: "BFD detects a failed routed path in milliseconds and notifies OSPF or BGP so routing can converge without waiting for long protocol timers.",
    deepDive: [
      "Bidirectional Forwarding Detection (BFD) provides a lightweight liveness session between forwarding devices. Routing protocols can register with BFD and react to a session-down event faster than their normal Hello/dead timers.",
      "BFD is a detection mechanism, not a routing protocol or path selector. Session mode, timers, echo support, hardware offload, and scale vary by platform; aggressive intervals can increase CPU and false failure risk.",
      "Enable it only on supported links and coordinate both ends, routing-protocol integration, and protection policies. Verify negotiated timers, session state, and measured failover, then test under load and review logs for flaps."
    ],
    lab: {
      title: "Accelerate a routed-link failure signal",
      scenario: "A branch OSPF path takes too long to withdraw after a silent provider forwarding failure.",
      steps: ["Confirm platform support and the intended BFD mode/interval on both peers.", "Enable BFD and associate the routing adjacency with the session.", "Measure failure detection and OSPF route convergence while monitoring CPU and flap counters."],
      check: "What does BFD contribute to routing?",
      choices: ["It selects BGP local preference", "A fast forwarding-path liveness signal that a routing protocol can consume", "It advertises VLANs", "It encrypts OSPF"],
      explanation: "BFD detects path failure quickly; the routing protocol uses that signal to withdraw or recompute routes.",
      command: "show bfd neighbors details\nshow ip ospf neighbor"
    },
    quiz: { prompt: "What is BFD's primary role when integrated with OSPF or BGP?", choices: ["Advertise prefixes", "Provide fast liveness detection for the forwarding path", "Assign IP addresses", "Encrypt route updates"], answer: 1, explanation: "BFD provides a rapid failure signal that routing protocols can use to accelerate convergence." }
  },
  "eigrp-fundamentals": {
    objective: "Interpret EIGRP neighbor relationships, successor, feasible successor, and composite metrics.",
    example: "A router installs a successor through the primary WAN and retains a feasible successor over a backup link when the reported distance satisfies the feasibility condition.",
    deepDive: [
      "EIGRP forms neighbors using matching autonomous-system context and compatible interface parameters, then exchanges prefixes. Its Diffusing Update Algorithm (DUAL) maintains loop-free paths and can use a feasible successor for rapid recovery.",
      "The successor is the best next hop; a feasible successor is a backup that satisfies the feasibility condition, where the neighbor's reported distance is lower than the local feasible distance. Bandwidth and delay are the usual default metric components.",
      "Named and classic configurations differ in structure. Verify neighbor state, topology table, feasible successors, K-values, passive interfaces, and route installation; equal AS numbers alone do not guarantee adjacency."
    ],
    lab: {
      title: "Verify a loop-free EIGRP backup",
      scenario: "A branch has two EIGRP paths; the backup does not appear as a feasible successor.",
      steps: ["Check neighbor state, autonomous system, K-values, and passive-interface configuration.", "Compare reported and feasible distances and inspect the topology table.", "Fail the successor in a controlled test and confirm reconvergence and route installation."],
      check: "What condition allows an EIGRP route to qualify as a feasible successor?",
      choices: ["Its neighbor has the highest router ID", "The reported distance is below the local feasible distance", "It has the longest prefix", "It uses a static default route"],
      explanation: "The feasibility condition uses reported distance less than feasible distance to provide a loop-free backup.",
      command: "show ip eigrp neighbors\nshow ip eigrp topology"
    },
    quiz: { prompt: "What is the EIGRP feasibility condition used to identify a loop-free backup?", choices: ["Reported distance is greater than feasible distance", "Reported distance is less than feasible distance", "Both paths use the same interface", "The backup has a lower VLAN ID"], answer: 1, explanation: "A neighbor is a feasible successor when its reported distance is less than the current feasible distance." }
  },
  "bgp-enterprise-edge": {
    objective: "Explain eBGP peering and basic policy at an enterprise internet edge.",
    example: "A dual-homed enterprise accepts a default route from two providers and prefers provider A for outbound traffic while advertising only its assigned aggregate.",
    deepDive: [
      "BGP exchanges reachability between autonomous systems using TCP port 179. eBGP peers are in different ASNs; iBGP peers share an ASN and have additional route-distribution rules. A neighbor session can be Established while carrying no useful accepted routes.",
      "BGP path selection uses attributes and implementation-specific tie-breaks, with local preference commonly controlling an enterprise's outbound choice and AS-path prepending influencing some inbound choices. Filters must restrict accepted and advertised prefixes.",
      "Use explicit prefix lists and route policies, max-prefix limits, authentication where supported, and a documented default/full-table decision. Verify session state, received/accepted/advertised routes, next-hop reachability, and actual data plane in both directions."
    ],
    lab: {
      title: "Protect a dual-provider BGP edge",
      scenario: "A router peers with two providers but must advertise only 203.0.113.0/24 and prefer provider A outbound.",
      steps: ["Confirm peer reachability, ASN, source interface, and BGP session state.", "Apply an inbound policy setting preferred local preference for provider A.", "Filter outbound advertisements to the assigned prefix and verify both providers' received routes."],
      check: "Which common BGP attribute influences an AS's own outbound path preference?",
      choices: ["VLAN native ID", "Local preference", "OSPF area number", "TCP window scale"],
      explanation: "Local preference is distributed within an AS and commonly steers which exit the AS prefers.",
      command: "router bgp 65010\n neighbor 198.51.100.1 remote-as 65001\n network 203.0.113.0 mask 255.255.255.0\nshow ip bgp summary"
    },
    quiz: { prompt: "Which BGP attribute is commonly used inside an AS to select a preferred exit?", choices: ["MED only", "Local preference", "OSPF cost", "EtherChannel hash"], answer: 1, explanation: "Higher local preference is commonly preferred within the AS, subject to the platform's BGP decision process." }
  },
  "ipv6-enterprise-routing": {
    objective: "Operate dual-stack routing and troubleshoot IPv6 neighbor discovery and route selection.",
    example: "A campus advertises 2001:db8:1200::/48 internally, assigns /64s per VLAN, and uses link-local next hops on OSPFv3 links.",
    deepDive: [
      "IPv6 uses 128-bit addresses, prefix lengths, link-local addresses, multicast, and Neighbor Discovery in place of IPv4 ARP. A link-local address is scoped to one interface and often appears as the next hop on a directly connected routed link.",
      "Dual stack runs IPv4 and IPv6 as separate protocol families over the same infrastructure. Each family needs its own addressing, routing, ACL, monitoring, and security validation; successful IPv4 reachability says nothing about IPv6 policy.",
      "Plan /64 LANs from an allocated site prefix, enable forwarding where routing is required, and validate RA/DHCPv6 behavior, neighbor cache, route table, and ICMPv6 dependencies. Avoid indiscriminate blocking of ICMPv6 because core functions rely on it."
    ],
    lab: {
      title: "Troubleshoot a dual-stack VLAN",
      scenario: "Clients receive IPv4 service but cannot reach their IPv6 default gateway.",
      steps: ["Inspect the interface's /64 address, link-local address, and IPv6 forwarding state.", "Check router advertisements, neighbor discovery, and IPv6 ACLs.", "Verify the IPv6 route and test the path using the correct source interface."],
      check: "Which protocol performs IPv6 on-link neighbor resolution?",
      choices: ["IPv4 ARP", "ICMPv6 Neighbor Discovery", "DHCPv4", "BGP communities"],
      explanation: "Neighbor Discovery uses ICMPv6 messages to resolve link-layer neighbors and perform related link functions.",
      command: "show ipv6 interface brief\nshow ipv6 neighbors\nshow ipv6 route"
    },
    quiz: { prompt: "What mechanism resolves an IPv6 on-link neighbor to a link-layer address?", choices: ["ARP", "ICMPv6 Neighbor Discovery", "NAT overload", "OSPF LSA flooding"], answer: 1, explanation: "IPv6 Neighbor Discovery uses ICMPv6 rather than IPv4 ARP." }
  },
  "multicast-fundamentals": {
    objective: "Trace multicast receiver membership, source traffic, and the routed distribution tree.",
    example: "Receivers join group 239.1.1.10; IGMP informs the first-hop router, while PIM builds a tree toward the source or rendezvous point.",
    deepDive: [
      "Multicast delivers one source stream to interested receivers using group addresses rather than one unicast copy per listener. Hosts signal membership with IGMP for IPv4 or MLD for IPv6; Layer 2 switches may use snooping to limit flooding.",
      "Routers use a multicast routing protocol such as PIM to build distribution trees. Source-specific and shared-tree behavior, rendezvous-point design, reverse-path forwarding checks, and unicast reachability all affect whether packets can flow.",
      "Troubleshoot in order: confirm the receiver joined the group, local IGMP state, source reachability, RPF interface, PIM neighbors, and outgoing interface list. A unicast ping succeeding does not prove multicast state is correct."
    ],
    lab: {
      title: "Trace a missing multicast stream",
      scenario: "A receiver joins a video group, but no stream arrives from the source.",
      steps: ["Confirm group membership on the receiver VLAN and IGMP snooping state.", "Check PIM neighbors, RPF route toward the source, and multicast route state.", "Inspect the outgoing interface list and verify source-to-receiver policy."],
      check: "What does the RPF check validate?",
      choices: ["The destination VLAN name", "That traffic arrives on the expected best unicast path toward its source", "The DHCP lease duration", "The TCP port-channel hash"],
      explanation: "RPF checks whether a multicast packet arrives on the interface the router would use to reach the source.",
      command: "show ip igmp groups\nshow ip pim neighbor\nshow ip mroute"
    },
    quiz: { prompt: "What does a multicast router's reverse-path-forwarding check validate?", choices: ["That the receiver has a DNS name", "That the packet arrives on the expected path toward its source", "That the source uses TCP", "That all VLANs share one subnet"], answer: 1, explanation: "RPF uses the unicast route toward the source to prevent forwarding loops and select valid multicast input." }
  },
  "qos-architecture": {
    objective: "Apply QoS classification, marking, queuing, shaping, and policing across a path.",
    example: "Voice is classified at the campus edge, marked EF, and placed in a bounded low-latency queue on a congested WAN link.",
    deepDive: [
      "QoS is a per-hop behavior, not an end-to-end reservation. Classification identifies traffic using trusted attributes; marking records a class such as DSCP; queuing schedules packets when an egress link is congested.",
      "Shaping buffers and smooths traffic to a configured rate, while policing measures and drops or remarks excess traffic. A strict-priority queue protects latency-sensitive traffic but must be bounded to prevent starving other classes.",
      "Define a consistent trust boundary and class map, preserve or rewrite markings intentionally, and validate queue counters under realistic congestion. QoS cannot create bandwidth; it decides how scarce bandwidth is shared."
    ],
    lab: {
      title: "Protect voice during congestion",
      scenario: "A WAN link is congested and voice suffers jitter while backups consume the link.",
      steps: ["Classify voice using a trusted marking or validated application match.", "Place voice in a bounded priority queue and allocate bandwidth to other classes.", "Generate competing traffic and verify queue drops, latency, and marking behavior."],
      check: "What is a risk of an unbounded strict-priority queue?",
      choices: ["It disables IP routing", "It can starve other traffic classes", "It prevents packet marking", "It reduces the MTU automatically"],
      explanation: "Priority traffic must be bounded so sustained overload cannot consume all link capacity and starve other classes.",
      command: "show policy-map interface\nshow interfaces"
    },
    quiz: { prompt: "What does traffic shaping do when traffic exceeds its configured rate?", choices: ["Always drops immediately", "Buffers and smooths traffic toward the configured rate", "Rewrites every source IP", "Creates a new VLAN"], answer: 1, explanation: "Shaping delays excess traffic in a queue to smooth the sending rate; policing typically drops or remarks excess." }
  },
  "wireless-enterprise-design": {
    objective: "Design enterprise WLAN control, roaming, RF, and wired integration.",
    example: "A controller-managed WLAN maps corporate and guest SSIDs to distinct policy domains while AP channel/power planning limits co-channel interference.",
    deepDive: [
      "Enterprise WLAN includes APs, controllers or cloud management, RF coverage, authentication, mobility, and wired switching. Centralized versus distributed forwarding changes where client traffic is bridged and which VLANs need to exist.",
      "RF design balances coverage, capacity, channel reuse, transmit power, client density, and interference. More APs do not automatically improve service if channel reuse and power are poorly planned.",
      "Trace an end user's association, authentication, IP assignment, policy, and roam between APs. Check RADIUS reachability, certificates, VLAN/policy mapping, DHCP, and client experience telemetry as separate stages."
    ],
    lab: {
      title: "Troubleshoot corporate WLAN onboarding",
      scenario: "A client authenticates to the SSID but receives no usable IP configuration.",
      steps: ["Verify WLAN-to-policy/VLAN mapping and AP/controller forwarding mode.", "Check DHCP scope/relay reachability and the client VLAN gateway.", "Review authentication result, DHCP exchange, and roaming/client telemetry."],
      check: "Successful 802.1X authentication proves which part of onboarding?",
      choices: ["The application is reachable", "Identity authentication succeeded, not necessarily DHCP or application access", "The RF channel is interference-free", "The default route is installed"],
      explanation: "Authentication is one stage; VLAN/policy mapping, DHCP, routing, and application access still need validation.",
      command: "show wireless client summary\nshow vlan brief\nshow ip dhcp snooping binding"
    },
    quiz: { prompt: "A WLAN client authenticates but has no IP address. Which stage should be checked next?", choices: ["The Internet BGP community", "Client VLAN/policy mapping and DHCP reachability", "The switch's serial number", "OSPF router-ID election"], answer: 1, explanation: "Authentication does not guarantee that the client reaches the correct VLAN and DHCP service." }
  },
  "telemetry-netflow": {
    objective: "Use flow records and streaming telemetry to investigate traffic and service behavior.",
    example: "NetFlow shows a backup host saturating a WAN circuit; interface queue telemetry confirms voice drops began at the same time.",
    deepDive: [
      "Flow telemetry summarizes conversations using fields such as source/destination, protocol, ports, byte counts, and timestamps. Streaming telemetry can export counters and state at a higher cadence than periodic polling.",
      "Choose records, exporters, sampling, and collectors according to platform capability and operational questions. Sampling and observation gaps mean flow data is evidence with limitations, not a complete packet capture.",
      "Synchronize clocks, secure transport and credentials, protect sensitive metadata, and correlate flow with interface queues, routing events, and application monitoring. Confirm a suspected cause with device counters or a scoped packet capture."
    ],
    lab: {
      title: "Find a bandwidth-heavy flow",
      scenario: "A site reports slow applications during a daily backup window.",
      steps: ["Filter flow records by interface, time, and top source/destination conversations.", "Compare export data with interface rates and QoS queue-drop counters.", "Validate the likely source and adjust approved scheduling or policy, then measure again."],
      check: "Why should sampled flow data be corroborated?",
      choices: ["It always contains payload content", "Sampling and export gaps can make it incomplete", "It replaces routing tables", "It can only describe DNS"],
      explanation: "Flow records may be sampled or incomplete; correlate them with counters and other evidence before changing policy.",
      command: "show flow monitor\nshow flow exporter\nshow policy-map interface"
    },
    quiz: { prompt: "A sampled flow report identifies a likely traffic source. What is the best next step?", choices: ["Block it without validation", "Correlate with interface and application evidence", "Disable all telemetry", "Change the OSPF area"], answer: 1, explanation: "Sampling and export coverage affect completeness; validate the hypothesis against device and application data." }
  },
  "snmpv3-syslog": {
    objective: "Configure secure monitoring and make syslog events operationally useful.",
    example: "SNMPv3 authPriv polls interface counters while timestamped syslog is sent to two collectors over a restricted management VRF.",
    deepDive: [
      "SNMP polling retrieves structured objects; traps/informs report events. SNMPv3 provides authentication and privacy options, unlike community-based SNMPv1/v2c. Use least-privilege views and protect credentials.",
      "Syslog messages carry severity and facility information and are most useful when device time is synchronized and source identity is stable. A collector should retain, filter, and correlate events with inventory and change records.",
      "Restrict management-plane access to approved collectors, use encrypted/authenticated versions where supported, monitor delivery failures, and test an event end to end. Avoid assuming that an enabled agent means data is reaching the monitoring system."
    ],
    lab: {
      title: "Verify secure monitoring",
      scenario: "The NMS polls some routers but misses a new distribution switch's interface counters.",
      steps: ["Check SNMPv3 user, view, source interface, ACL, and NMS reachability.", "Verify device time, syslog destination, severity, and collector ingestion.", "Generate a test event and confirm it is correlated to the correct inventory record."],
      check: "What security improvement does SNMPv3 authPriv provide?",
      choices: ["It disables all polling", "Authentication and message privacy", "It replaces device routing", "It adds VLAN tags to syslog"],
      explanation: "SNMPv3 authPriv provides authentication and encryption/privacy for management messages when correctly configured.",
      command: "show snmp user\nshow logging\nshow ntp associations"
    },
    quiz: { prompt: "Which SNMPv3 security level provides both authentication and privacy?", choices: ["noAuthNoPriv", "authPriv", "readOnly", "community-only"], answer: 1, explanation: "authPriv combines message authentication with privacy/encryption." }
  },
  "span-erspan": {
    objective: "Select local SPAN or remote ERSPAN for scoped packet visibility.",
    example: "An engineer mirrors a single access port to a local analyzer for five minutes rather than exporting an entire switch fabric.",
    deepDive: [
      "SPAN mirrors selected ingress/egress traffic to a monitor port; ERSPAN encapsulates mirrored packets for delivery to a remote analyzer across an IP network. Availability and syntax vary by platform.",
      "Mirroring can oversubscribe the destination and drop captured packets, and some hardware features may affect which traffic is visible. Mirroring sensitive segments may expose credentials or personal data.",
      "Use a narrow source, direction, VLAN, and time window; secure the analyzer path and obtain authorization. Validate capture loss and remove the session after the investigation."
    ],
    lab: {
      title: "Capture a failing access port",
      scenario: "A packet analyzer must observe both directions of one workstation link without mirroring the whole VLAN.",
      steps: ["Choose the source interface and required direction; estimate traffic volume.", "Select an authorized local monitor destination or secured ERSPAN path.", "Confirm packets arrive and remove the mirror session after the capture."],
      check: "What is a key risk when mirroring to an undersized destination?",
      choices: ["The source IP changes", "The monitor port may drop mirrored traffic under load", "OSPF stops calculating", "VLAN IDs are encrypted"],
      explanation: "If mirrored traffic exceeds destination capacity, packets can be dropped; narrow the capture and monitor loss.",
      command: "show monitor session all\nshow interfaces"
    },
    quiz: { prompt: "What does ERSPAN add compared with a local SPAN session?", choices: ["A new OSPF area", "Encapsulation to transport mirrored traffic to a remote analyzer", "Automatic payload encryption", "A DHCP relay"], answer: 1, explanation: "ERSPAN carries mirrored traffic over an IP network; it is not automatically a confidentiality mechanism." }
  },
  "ip-sla-object-tracking": {
    objective: "Use IP SLA probes and object tracking to make failover depend on verified service reachability.",
    example: "A branch tracks an ICMP probe to an upstream service and withdraws a static default when the primary path stops reaching that target.",
    deepDive: [
      "An IP SLA operation generates a synthetic measurement such as ICMP echo, UDP jitter, or an HTTP request, depending on platform support. Probe target and source must represent the service path you intend to validate.",
      "Object tracking turns an SLA result into state that can influence a route, policy, or redundancy decision. Tracking only the directly connected gateway may miss upstream failures beyond that router.",
      "Set reasonable frequency, timeout, thresholds, and recovery delay to avoid flapping. Test false positives, target failure, and restoration; a probe is a measurement, not proof that every user application works."
    ],
    lab: {
      title: "Track upstream service reachability",
      scenario: "The WAN interface stays up when the provider loses upstream internet reachability.",
      steps: ["Choose a stable target beyond the first-hop gateway and source the probe correctly.", "Tie the SLA result to an object and the primary route or gateway decision.", "Simulate target failure and recovery; inspect route changes and avoid rapid flapping."],
      check: "Why probe beyond the directly connected gateway?",
      choices: ["To increase VLAN count", "To detect failures farther along the service path", "To elect an OSPF DR", "To configure SNMP encryption"],
      explanation: "A live first-hop router does not guarantee upstream service; a representative remote target can detect farther-path failures.",
      command: "show ip sla statistics\nshow track\nshow ip route"
    },
    quiz: { prompt: "A WAN interface is up but the provider has an upstream outage. What should an SLA probe target?", choices: ["Only the local interface address", "A stable destination beyond the first hop", "The switch's management VLAN", "The router's hostname"], answer: 1, explanation: "A target beyond the local gateway can reveal service-path failure even while the physical interface remains up." }
  },
  "troubleshooting-method": {
    objective: "Use evidence-driven, layered troubleshooting and verify both control and data planes.",
    example: "A routing adjacency is established, but users still fail: the engineer checks the installed route, ACL counters, return path, and application port rather than stopping at neighbor state.",
    deepDive: [
      "Define the symptom, scope, start time, recent changes, and expected behavior. Build a path map and compare a working and failing endpoint, protocol, direction, or site to narrow the fault domain.",
      "Check physical and link state, VLAN and addressing, neighbor relationships, routing table, policy/ACL/NAT, transport behavior, then application health. Separate control-plane evidence (routes learned) from data-plane evidence (packets forwarded).",
      "Form one testable hypothesis at a time, capture before/after counters, and change one variable in an approved window. Verify the original service and adjacent services after a fix; document cause, evidence, rollback, and prevention."
    ],
    lab: {
      title: "Diagnose an established-but-broken path",
      scenario: "OSPF is Full and the destination route exists, but an application times out from one subnet.",
      steps: ["Compare a working and failing source; trace forward and return routes.", "Inspect interface counters, ACL/NAT matches, and application port reachability.", "Change only the proven fault, retest end-to-end, and record evidence and rollback."],
      check: "Why is an established routing neighbor not sufficient proof of application connectivity?",
      choices: ["Routing never affects forwarding", "Policy, return path, transport, or application can still fail", "A neighbor is always a DNS server", "Applications use only Layer 2"],
      explanation: "Adjacency proves a control-plane relationship, not that the complete bidirectional application path is permitted and healthy.",
      command: "show ip ospf neighbor\nshow ip route\nshow access-lists\nshow interfaces"
    },
    quiz: { prompt: "An OSPF neighbor is Full but an application times out. What is the best troubleshooting principle?", choices: ["Stop because routing is proven", "Validate the end-to-end data path, policy, return route, and service", "Reset every router", "Disable all ACLs"], answer: 1, explanation: "Control-plane adjacency does not prove that the data path or application policy is healthy." }
  },
  "aaa-tacacs-radius": {
    objective: "Compare TACACS+ and RADIUS and design resilient centralized AAA with safe fallback.",
    example: "Network administrators authenticate to TACACS+ for per-command authorization while wireless clients use RADIUS for 802.1X access.",
    deepDive: [
      "AAA separates authentication (who), authorization (what actions), and accounting (what happened). TACACS+ commonly supports granular device-administrator command authorization; RADIUS is widely used for network access and carries authentication/authorization attributes.",
      "Central AAA introduces dependencies on DNS/routing, shared secrets or certificates, clocks, and server availability. Use protected management paths, redundant servers, least privilege, and a carefully controlled local emergency account.",
      "Test success, denial, server timeout, accounting, and break-glass behavior before rollout. Keep console access and rollback procedures; a method list that falls through unsafely can lock out operators or silently grant excess privilege."
    ],
    lab: {
      title: "Validate administrator AAA safely",
      scenario: "A new TACACS+ policy must authorize a read-only operator and preserve controlled emergency access.",
      steps: ["Verify server reachability, identity mapping, privilege policy, and accounting destination.", "Test allowed and denied commands using a non-production test account.", "Simulate AAA timeout from console and confirm only the approved local fallback works."],
      check: "Which fallback design best reduces lockout risk without weakening routine access?",
      choices: ["Permit unauthenticated access", "Use a protected, audited local break-glass account tested from console", "Share the enable password broadly", "Disable accounting"],
      explanation: "A restricted, protected emergency account provides recovery if central AAA is unavailable without weakening normal authentication.",
      command: "show aaa servers\nshow running-config | section aaa"
    },
    quiz: { prompt: "Which protocol is commonly used for granular network-device command authorization?", choices: ["DNS", "TACACS+", "NTP", "IGMP"], answer: 1, explanation: "TACACS+ is commonly used for centralized administrator authentication and per-command authorization." }
  },
  "trustsec-macsec": {
    objective: "Distinguish identity-based TrustSec segmentation from link-layer MACsec protection.",
    example: "An authenticated endpoint receives a security-group tag used in policy, while MACsec protects frames over a sensitive switch-to-switch link.",
    deepDive: [
      "Cisco TrustSec uses identity and security-group information to express policy independently of a host's changing IP address. Security-group tags and policy enforcement depend on supported devices, propagation, and deployment design.",
      "MACsec (IEEE 802.1AE) provides link-layer confidentiality, integrity, and replay protection on supported Ethernet links using negotiated keys. It protects a link segment; it does not replace end-to-end application encryption or identity policy.",
      "Plan identity classification, tag propagation, enforcement points, key management, hardware/software compatibility, and failure behavior. Verify the tag and policy decision separately from MACsec session state and encrypted-link counters."
    ],
    lab: {
      title: "Separate identity policy from link encryption",
      scenario: "A user must be limited by role, and a switch uplink must protect frames in transit.",
      steps: ["Map the authenticated identity to the intended security group and enforcement policy.", "Check MACsec capability, key agreement, and session state at both uplink ends.", "Verify policy hits and secure-link counters independently with authorized test traffic."],
      check: "Which function is provided by MACsec?",
      choices: ["Routing between VRFs", "Link-layer integrity and confidentiality on a protected Ethernet link", "Identity assignment for every application", "OSPF route summarization"],
      explanation: "MACsec protects Ethernet frames on a link; TrustSec identity tags and policy are separate functions.",
      command: "show cts role-based permissions\nshow macsec interface"
    },
    quiz: { prompt: "What does MACsec primarily protect?", choices: ["BGP route selection", "Ethernet frames across a supported link", "The DHCP database", "A complete end-to-end application session"], answer: 1, explanation: "MACsec protects Layer 2 traffic on the link; it is distinct from TrustSec identity-based policy and end-to-end TLS." }
  },
  "dot1x-access-control": {
    objective: "Trace 802.1X supplicant, authenticator, and authentication-server roles.",
    example: "A laptop supplicant authenticates through a switch authenticator to RADIUS; the returned policy assigns an approved VLAN and downloadable access rules.",
    deepDive: [
      "802.1X controls port access through a supplicant (client), authenticator (switch or AP), and authentication server (commonly RADIUS). EAP messages are carried between client and authenticator and relayed to the server.",
      "Authentication success does not by itself guarantee an application path: authorization may assign a VLAN, role, ACL, or session policy, followed by DHCP and routing. Certificate trust and identity mapping are frequent failure points.",
      "Plan guest and nonresponsive-device handling, critical authentication behavior, reauthentication, profiling, and fallback carefully. Logs must distinguish EAP failure, server timeout, authorization rejection, and post-authentication network failure."
    ],
    lab: {
      title: "Trace an 802.1X failure",
      scenario: "A laptop is repeatedly denied access even though the user enters the expected credentials.",
      steps: ["Check supplicant EAP method, certificate trust, switch port state, and RADIUS reachability.", "Inspect server reason codes and returned authorization attributes.", "After successful authentication, verify VLAN assignment, DHCP, and application reachability."],
      check: "Which device acts as the 802.1X authenticator on a wired access port?",
      choices: ["The DNS server", "The access switch", "The endpoint DHCP client", "The Internet provider"],
      explanation: "The switch mediates EAP between the endpoint supplicant and authentication server and enforces the resulting access decision.",
      command: "show authentication sessions\nshow radius statistics"
    },
    quiz: { prompt: "In wired 802.1X, which component typically acts as the authenticator?", choices: ["The laptop supplicant", "The access switch", "The DNS resolver", "The NTP server"], answer: 1, explanation: "The access switch controls the port and relays authentication exchange to the RADIUS server." }
  },
  "control-plane-policing": {
    objective: "Protect device control planes without disrupting legitimate routing and management traffic.",
    example: "A router uses a measured control-plane policy to rate-limit unnecessary traffic to the CPU while preserving OSPF, BGP, and authorized SSH.",
    deepDive: [
      "The control plane processes routing protocols, management sessions, and packets destined to the device itself. Excessive punted traffic can consume CPU even when transit forwarding hardware remains healthy.",
      "Control-plane policing classifies and rate-limits selected traffic to the CPU. Incorrect matches or thresholds can drop routing Hellos, BGP, ICMP needed for diagnostics, or management access and trigger an outage.",
      "Establish baseline rates, understand platform defaults and hardware behavior, stage policy with console access, and monitor class counters and adjacency health. CoPP is a safeguard, not a replacement for filtering and secure management."
    ],
    lab: {
      title: "Review a control-plane policy",
      scenario: "After a CoPP change, BGP intermittently resets and CPU utilization is high.",
      steps: ["Inspect CoPP class matches, rates, drops, and control-plane CPU counters.", "Confirm critical protocol and management packets match intended classes.", "Adjust only after platform-specific validation, then observe sessions and counters."],
      check: "What is a major risk of an overly restrictive CoPP policy?",
      choices: ["It increases VLAN IDs", "It can drop legitimate routing and management packets to the CPU", "It automatically encrypts BGP", "It changes all route metrics"],
      explanation: "CoPP protects the CPU, but thresholds and classifiers that are too restrictive can disrupt critical control traffic.",
      command: "show policy-map control-plane\nshow processes cpu sorted"
    },
    quiz: { prompt: "What can happen when a CoPP class rate is set too low for legitimate control traffic?", choices: ["The device gains extra bandwidth", "Routing or management packets may be dropped", "The interface becomes a trunk", "All packets are encrypted"], answer: 1, explanation: "A restrictive policy can drop legitimate packets destined to the CPU and destabilize routing or management." }
  },
  "layer2-hardening": {
    objective: "Combine DHCP snooping, Dynamic ARP Inspection, IP Source Guard, and STP edge protections.",
    example: "An access switch trusts only the uplink for DHCP server messages, inspects ARP against snooping bindings, and guards user-facing edge ports.",
    deepDive: [
      "DHCP snooping distinguishes trusted server-facing ports from untrusted client ports and builds bindings. Dynamic ARP Inspection can validate ARP against those bindings; IP Source Guard can constrain a port to its learned IP/MAC/VLAN binding.",
      "Port security, BPDU Guard, storm control, and root protections address different threats and failure modes. Trust settings must follow actual topology: an incorrectly trusted edge port can bypass protections.",
      "Stage features per VLAN and port type, account for static-IP devices and relay paths, and monitor err-disable or drop counters. Validate legitimate DHCP renewals, ARP, voice/data VLANs, and recovery before broad enforcement."
    ],
    lab: {
      title: "Protect an untrusted access edge",
      scenario: "An unmanaged device may offer rogue DHCP and ARP replies on a user-facing port.",
      steps: ["Enable DHCP snooping on the client VLAN and trust only verified server/uplink paths.", "Enable ARP inspection using valid bindings and handle static hosts explicitly.", "Test a normal client lease and inspect drops, bindings, and edge-port protection state."],
      check: "Which port should normally be trusted for DHCP snooping server messages?",
      choices: ["Every user access port", "Only the verified path toward legitimate DHCP servers", "All ports in the VLAN", "No uplink under any condition"],
      explanation: "Trust only known server-facing paths; user-facing ports remain untrusted so rogue server replies are blocked.",
      command: "ip dhcp snooping\nip dhcp snooping vlan 10\ninterface GigabitEthernet1/0/48\n ip dhcp snooping trust"
    },
    quiz: { prompt: "In DHCP snooping, which interfaces should normally be trusted?", choices: ["All endpoint ports", "Only verified paths toward legitimate DHCP servers", "Every interface in the VLAN", "No switch uplinks"], answer: 1, explanation: "Trust the legitimate server-facing path and leave client-facing ports untrusted." }
  },
  "ipv4-ipv6-acl-policy": {
    objective: "Construct ordered, least-privilege IPv4/IPv6 ACL policy and validate direction and counters.",
    example: "An extended ACL permits a monitoring subnet to reach SSH on network devices, permits established return traffic as designed, and logs only selected denies.",
    deepDive: [
      "ACL entries are evaluated top to bottom and the first match decides; an implicit deny follows if no entry matches. Extended rules can match source, destination, protocol, and ports; IPv6 ACLs have family-specific behavior and required control traffic considerations.",
      "Direction is relative to an interface: inbound filters packets as they enter, outbound before they leave. Place policy where it limits unwanted traffic without accidentally blocking management, routing protocols, DHCP, or IPv6 Neighbor Discovery.",
      "Use object/group abstractions and named, reviewable policy where supported. Check hit counters, test both traffic directions and return paths, and avoid broad any-any permits or unreviewed logging that can overwhelm device CPU."
    ],
    lab: {
      title: "Permit a management service only",
      scenario: "Only 192.0.2.0/24 may SSH to device management addresses; other sources must be blocked.",
      steps: ["Write ordered source, destination, protocol, and port requirements before configuration.", "Apply the ACL in the correct interface direction and preserve required control traffic.", "Test an allowed and denied source and inspect rule counters and return traffic."],
      check: "What happens when no ACL entry matches a packet?",
      choices: ["It is always forwarded", "The implicit deny blocks it", "It is sent to DNS", "It is NAT translated"],
      explanation: "An ACL normally ends with an implicit deny; explicitly permit required traffic before that outcome.",
      command: "ip access-list extended DEVICE-MGMT\n permit tcp 192.0.2.0 0.0.0.255 any eq 22\n deny ip any any log"
    },
    quiz: { prompt: "What is the default result if an ACL packet matches no explicit entry?", choices: ["Permit", "Implicit deny", "Route to the CPU", "NAT overload"], answer: 1, explanation: "ACL processing has an implicit deny at the end unless a platform-specific policy model says otherwise." }
  },
  "netconf-restconf-yang": {
    objective: "Distinguish NETCONF, RESTCONF, and YANG models for structured network management.",
    example: "A controller reads interface operational state using a YANG-modeled API, then proposes a reviewed configuration update to a lab switch.",
    deepDive: [
      "YANG defines structured data models for configuration and operational state. NETCONF commonly uses an RPC model over a secure transport and supports datastore operations; RESTCONF exposes modeled resources through HTTP methods.",
      "Model-driven interfaces reduce brittle screen scraping but do not remove the need to understand namespace, schema revision, datastore, transaction, and device support. A successful request can still target the wrong resource or set an unsafe value.",
      "Use authenticated encrypted access, least privilege, schema validation, dry-run or candidate workflows where available, and post-change verification. Never place credentials in source control or log sensitive response bodies."
    ],
    lab: {
      title: "Read interface state through a model",
      scenario: "An automation client must retrieve link state without scraping CLI text.",
      steps: ["Check the device's enabled API, supported YANG module/revision, and access scope.", "Issue a documented read request and validate status, schema, and returned interface key.", "Compare the structured state to CLI output and safely handle missing fields."],
      check: "What does YANG primarily provide?",
      choices: ["A physical transport cable", "A data model describing structured configuration and state", "An encryption algorithm", "An Ethernet VLAN tag"],
      explanation: "YANG models data structures and constraints; NETCONF or RESTCONF transports operations against supported models.",
      command: "show netconf-yang sessions\nshow platform software yang-management process"
    },
    quiz: { prompt: "What role does YANG play in model-driven networking?", choices: ["It routes packets", "It defines structured data models and constraints", "It replaces TLS", "It elects an STP root"], answer: 1, explanation: "YANG describes data schemas; management protocols such as NETCONF/RESTCONF exchange modeled data." }
  },
  "network-json-data": {
    objective: "Read and validate JSON objects, arrays, types, and nested network API responses.",
    example: "An API returns an interface object with a string name, Boolean admin state, and numeric speed; the script validates all three before reporting.",
    deepDive: [
      "JSON objects contain key/value pairs and arrays contain ordered values. Strings use double quotes; numbers, true, false, null, nested objects, and arrays have distinct types that clients must preserve.",
      "An API response's schema defines what fields mean. A missing field, null value, empty array, string containing digits, and numeric value are not interchangeable; careless coercion can produce incorrect device changes.",
      "Validate response status, content type, required keys, types, and allowed values. Use a parser rather than string matching, handle malformed input explicitly, and redact tokens or sensitive configuration from logs."
    ],
    lab: {
      title: "Validate an interface API response",
      scenario: "A script consumes JSON describing an interface and must reject incomplete state safely.",
      steps: ["Parse the JSON and confirm the top-level object and expected interface key exist.", "Validate the name string, operational Boolean, and speed number without unsafe coercion.", "Report missing or malformed fields explicitly and compare a valid result with device state."],
      check: "In JSON, what is the type of the unquoted literal true?",
      choices: ["String", "Boolean", "Number", "Object"],
      explanation: "Unquoted true is a Boolean; the quoted value \"true\" is a string and must not be silently treated as equivalent.",
      command: "{\"name\":\"GigabitEthernet0/1\",\"oper-status\":\"up\",\"speed\":1000}"
    },
    quiz: { prompt: "What is the JSON type of unquoted true?", choices: ["String", "Boolean", "Number", "Array"], answer: 1, explanation: "The literal true is a Boolean; \"true\" in quotes is a string." }
  },
  "python-network-apis": {
    objective: "Build safe API automation with Python, structured data, validation, and explicit error handling.",
    example: "A script reads interface inventory through an authenticated API, validates expected keys, and generates a review-only report rather than pushing changes immediately.",
    deepDive: [
      "A reliable network script separates transport, authentication, parsing, validation, decision, and action. Use structured libraries, timeouts, TLS verification, bounded retries, and clear handling for non-2xx responses.",
      "Treat device responses as untrusted input: validate types, required keys, address formats, and device identity before deriving changes. Make operations idempotent when possible and avoid blindly retrying non-idempotent actions.",
      "Protect tokens with a secret store/environment injection, redact them from logs, scope targets to an inventory, and produce a diff or dry-run before changes. Record per-device results and verify live state after the operation."
    ],
    lab: {
      title: "Create a read-only inventory report",
      scenario: "An engineer needs interface status from ten lab routers using a documented REST API.",
      steps: ["Load device targets and a least-privilege credential from a protected source.", "Use HTTPS with certificate verification, timeouts, and explicit status/schema checks.", "Report missing/invalid responses distinctly and compare a sample result with CLI."],
      check: "What should a script do when an API response lacks a required field?",
      choices: ["Assume the interface is up", "Validate and report the malformed or incomplete response", "Retry forever", "Print the authentication token"],
      explanation: "Explicit validation prevents a success-shaped assumption from turning missing or malformed data into unsafe automation.",
      command: "GET /restconf/data/ietf-interfaces:interfaces-state/interface"
    },
    quiz: { prompt: "An API response omits a required interface-state field. What is the safest automation behavior?", choices: ["Assume the interface is healthy", "Validate and report incomplete data explicitly", "Disable TLS verification", "Retry indefinitely"], answer: 1, explanation: "Validate required fields and surface incomplete data instead of silently inventing state." }
  },
  "ansible-network-automation": {
    objective: "Use inventories, variables, templates, idempotence, and verification in network playbooks.",
    example: "A reviewed playbook applies NTP and management ACL standards to a three-router staging inventory before promotion to production.",
    deepDive: [
      "Ansible network automation uses an inventory to define targets and groups, variables to express differences, and tasks or roles to apply intent. Network collections and connection plugins are platform/version-specific.",
      "Idempotent modules aim to converge devices toward declared state rather than append duplicate commands. Check mode and diffs can help review changes, but support varies and a reported clean run is not proof of correct forwarding.",
      "Scope the inventory, protect secrets with an approved vault, use serial/batch controls for blast-radius management, capture backups, and define rollback. Verify with a separate show-state or API assertion after applying."
    ],
    lab: {
      title: "Stage a multi-router baseline",
      scenario: "Three lab routers need a consistent NTP server and a restricted SSH management ACL.",
      steps: ["Limit inventory to the lab group and store credentials in a protected vault.", "Run syntax/check mode and review the rendered change for each device.", "Apply in a small batch and verify NTP status and ACL attachment independently."],
      check: "What does idempotence help ensure?",
      choices: ["The playbook cannot cause an outage", "Repeated runs converge without duplicating intended configuration", "Credentials are automatically encrypted in every log", "No verification is needed"],
      explanation: "Idempotence supports repeatable convergence but does not eliminate review, scoped rollout, or verification.",
      command: "ansible-playbook -i inventory.yml baseline.yml --check --diff"
    },
    quiz: { prompt: "What is a key property of an idempotent network automation task?", choices: ["It always runs only once", "Repeated runs converge without duplicating the intended state", "It guarantees zero downtime", "It hides all changes"], answer: 1, explanation: "Idempotent tasks are repeatable with respect to the declared state, but still need review and validation." }
  },
  "event-driven-automation": {
    objective: "Use event-driven automation for bounded responses with safeguards, approvals, and audit trails.",
    example: "A link-down event opens an incident and gathers interface, neighbor, and route evidence; it does not automatically shut down neighboring uplinks.",
    deepDive: [
      "Event-driven automation reacts to a signal such as syslog, telemetry threshold, webhook, or controller event. A workflow can enrich the event with inventory and topology data before deciding whether to notify or act.",
      "Triggers can be duplicated, delayed, spoofed, or noisy. Make handlers idempotent, validate source and payload, rate-limit repeated events, and set explicit scope, timeout, and human-approval requirements for disruptive actions.",
      "Log the trigger, evidence, decision, change, and rollback outcome. Start with read-only diagnostics or ticket creation, then expand to reversible actions only after tests demonstrate bounded behavior and safe failure handling."
    ],
    lab: {
      title: "Automate a safe link-down response",
      scenario: "A monitoring event should collect diagnostics and alert an operator without changing routing configuration.",
      steps: ["Validate event source, device identity, interface, timestamp, and duplicate-event handling.", "Run scoped read-only checks for interface errors, neighbor state, and routes.", "Write the evidence to an audit record and request approval before any remediation."],
      check: "What is a safe first stage for a new event-driven workflow?",
      choices: ["Automatically shut every uplink", "Collect read-only evidence and notify an operator", "Disable authentication", "Apply an unreviewed route map"],
      explanation: "A read-only workflow provides evidence while limiting blast radius; automate disruptive actions only with explicit guardrails.",
      command: "show interfaces\nshow ip ospf neighbor\nshow ip route"
    },
    quiz: { prompt: "How should a newly deployed event-driven remediation workflow begin?", choices: ["Make broad changes automatically", "Start with scoped read-only diagnostics and operator notification", "Disable logging", "Trust all webhooks"], answer: 1, explanation: "Read-only diagnostics reduce risk while validating event quality and workflow behavior." }
  },
  "catalyst-center-automation": {
    objective: "Explain controller-based campus provisioning, assurance, and policy workflows.",
    example: "Catalyst Center provisions a validated switch template and reports a client onboarding issue using device, wireless, and application telemetry.",
    deepDive: [
      "Cisco DNA Center is now branded Cisco Catalyst Center in current product naming. It provides centralized workflows for inventory, provisioning, assurance, and policy across supported campus infrastructure.",
      "A controller orchestrates intent and workflows; devices still forward packets and maintain local control-plane state. Software, hardware, license, API, and feature support must be checked against the deployed release.",
      "Use staged templates, change control, role-based access, and pre/post checks. Assurance insights are evidence for investigation, not automatic proof of root cause; correlate with device state and reproduce the client path."
    ],
    lab: {
      title: "Stage a controller-managed change",
      scenario: "A switch template adds a new access VLAN to a pilot building before campus rollout.",
      steps: ["Confirm inventory health, software compatibility, template variables, and pilot scope.", "Review the proposed configuration and deployment impact before approval.", "Deploy to the pilot, verify clients and uplinks, then compare assurance signals."],
      check: "Does a controller replace the device data plane?",
      choices: ["Yes, all packets pass through the controller", "No; devices continue forwarding while the controller manages workflows and policy", "Only for IPv6", "Only during provisioning"],
      explanation: "The controller manages and coordinates supported workflows; network devices continue to forward traffic.",
      command: "show version\nshow running-config"
    },
    quiz: { prompt: "What is the role of a campus controller such as Catalyst Center?", choices: ["Forward all campus packets centrally", "Coordinate management, provisioning, assurance, and policy workflows", "Replace all Layer 2 switches", "Provide a universal Internet connection"], answer: 1, explanation: "The controller centralizes supported management workflows; forwarding remains on the network devices." }
  },
  "ospf-multi-area": {
    objective: "Diagnose multi-area OSPF, ABR/ASBR roles, route types, and area design.",
    example: "An ABR connects area 12 to area 0 and advertises a summarized branch prefix; an ASBR injects a controlled external route with an explicit metric type.",
    deepDive: [
      "An area limits link-state flooding and SPF scope. Area 0 is the backbone; ABRs connect area 0 to other areas, while ASBRs introduce external routes. OSPF route codes distinguish intra-area, inter-area, and external information.",
      "Stub, totally stubby (implementation-specific), and NSSA designs control which external or summary LSAs enter an area. Area type and virtual-link design must be consistent and should follow a deliberate failure-domain plan.",
      "Summarization reduces table and LSA churn only when address blocks are contiguous and black-hole behavior is acceptable. Inspect LSDB contents, ABR/ASBR role, route type, metric, and next hop when a route is missing or suboptimal."
    ],
    lab: {
      title: "Trace an inter-area route",
      scenario: "A remote branch route is missing from area 20 after an area redesign.",
      steps: ["Confirm each ABR has the intended area 0 and non-backbone adjacencies.", "Inspect LSA type, area type, summary filters, and address continuity.", "Verify the route appears with the expected type and next hop at a remote router."],
      check: "Which OSPF role connects a non-backbone area to area 0?",
      choices: ["A DHCP relay", "An Area Border Router (ABR)", "A DR only", "A route reflector"],
      explanation: "An ABR has interfaces in multiple areas and connects non-backbone areas to the backbone.",
      command: "show ip ospf database\nshow ip route ospf\nshow ip ospf border-routers"
    },
    quiz: { prompt: "Which OSPF router role connects a non-backbone area to area 0?", choices: ["ASBR only", "ABR", "DR", "BGP route reflector"], answer: 1, explanation: "An ABR connects areas, including the backbone and one or more non-backbone areas." }
  },
  "ospf-lsa-filtering": {
    objective: "Interpret common OSPF LSA types and apply route filtering at the correct boundary.",
    example: "An ABR summarizes and filters inter-area prefixes while an NSSA ASBR translates Type 7 external information into Type 5 for the backbone.",
    deepDive: [
      "Type 1 and 2 LSAs describe routers and multiaccess networks within an area; Type 3 summarizes inter-area networks; Type 4 describes reachability to an ASBR; Type 5 carries external routes; Type 7 is used for NSSA external routes.",
      "Filtering at an ABR affects inter-area information, while external filtering and redistribution policy are handled at ASBR boundaries. LSA visibility and route installation are related but not identical; an LSA may exist yet lose route selection.",
      "Use prefix lists, route maps, area range/filter features, and default-information controls only where supported and appropriate. Compare LSDB, route table, and forwarding path before and after; ensure filtering does not remove required transit or return routes."
    ],
    lab: {
      title: "Find an unexpectedly advertised prefix",
      scenario: "A branch receives an external prefix that should remain local to an NSSA.",
      steps: ["Identify the LSA type and originating ASBR from the LSDB.", "Trace NSSA translation and ABR policy between the source and receiving area.", "Apply a narrow boundary filter and verify both LSDB and route table behavior."],
      check: "Which LSA type is used for external routes inside an NSSA before translation?",
      choices: ["Type 2 only", "Type 7", "Type 3", "Type 4"],
      explanation: "NSSA external routes use Type 7 LSAs; an ABR may translate them into Type 5 for other areas.",
      command: "show ip ospf database nssa-external\nshow ip ospf database external"
    },
    quiz: { prompt: "Which LSA type represents external routes within an NSSA?", choices: ["Type 1", "Type 7", "Type 3", "Type 2"], answer: 1, explanation: "Type 7 LSAs carry external routes in an NSSA and may be translated at an ABR." }
  },
  "eigrp-advanced": {
    objective: "Troubleshoot EIGRP named configuration, summarization, authentication, and unequal-cost paths.",
    example: "A named EIGRP process summarizes contiguous branch routes and uses variance only after the feasibility condition and metric policy are verified.",
    deepDive: [
      "Advanced EIGRP operations include named address families, interface-level settings, authentication, passive-interface policy, stub routing, and route summarization. Configuration hierarchy differs from classic mode, so inspect the active address-family context.",
      "DUAL maintains loop-free paths; variance can install unequal-cost feasible paths within a bounded metric ratio. It does not override loop-free conditions, and traffic sharing depends on platform behavior and configured maximum paths.",
      "Summaries can reduce routing state but may create a discard route and hide a more-specific path if designed carelessly. Verify topology table distances, installed paths, summary boundaries, authentication state, and traffic distribution."
    ],
    lab: {
      title: "Investigate unequal-cost EIGRP paths",
      scenario: "A backup path has adequate capacity but is not installed for load sharing.",
      steps: ["Check K-values, successor/feasible successor state, and reported/feasible distances.", "Inspect variance, maximum-path, interface metrics, and any summary or filter.", "Verify installed next hops and measure actual flow distribution."],
      check: "Does EIGRP variance permit a route that fails the feasibility condition?",
      choices: ["Yes, variance bypasses loop checks", "No; candidate paths must still satisfy loop-free requirements", "Only when using IPv6", "Only for static routes"],
      explanation: "Variance controls allowable metric difference, but loop-free feasibility rules still govern eligible paths.",
      command: "show ip eigrp topology all-links\nshow ip route eigrp"
    },
    quiz: { prompt: "Can EIGRP variance install an alternate path that fails the feasibility condition?", choices: ["Yes, always", "No, loop-free eligibility still applies", "Only in stub networks", "Only if OSPF is enabled"], answer: 1, explanation: "Variance affects metric eligibility among loop-free paths; it does not remove DUAL's safety condition." }
  },
  "bgp-path-policy": {
    objective: "Troubleshoot BGP policy, attributes, next-hop reachability, and route installation.",
    example: "A route is received from both peers, but the preferred provider is not selected because its local preference policy did not match the prefix.",
    deepDive: [
      "BGP selects among paths using attributes including weight on some platforms, local preference, locally originated status, AS-path length, origin, MED under defined comparison rules, eBGP/iBGP preference, and next-hop cost. Exact ordering and tie-breaks are implementation-specific.",
      "Route maps can set or match attributes; prefix lists and AS-path lists can filter announcements. Policy syntax alone is not proof it matched—inspect received, accepted, best, and advertised paths and their attributes.",
      "A valid BGP path may not install if its next hop is unreachable or another protocol wins route selection. Use route refresh or soft reconfiguration capabilities carefully, and validate intended outbound announcements at the peer."
    ],
    lab: {
      title: "Correct an unexpected BGP best path",
      scenario: "Provider B is selected even though provider A should have higher local preference.",
      steps: ["Inspect all paths, local preference, route-map match counters, and next-hop reachability.", "Correct the inbound policy and refresh routes using supported non-disruptive methods.", "Verify best path, RIB/FIB installation, and only the intended outbound advertisements."],
      check: "A BGP route is present but not installed. Which condition is a common cause?",
      choices: ["The VLAN has a description", "The BGP next hop is unreachable or another route wins selection", "NTP is synchronized", "The host has IPv6 enabled"],
      explanation: "BGP may know a path but fail to install it if the next hop cannot resolve or route selection prefers another source.",
      command: "show ip bgp 203.0.113.0\nshow ip route 198.51.100.1\nshow ip bgp neighbors"
    },
    quiz: { prompt: "A BGP path is received but absent from the routing table. What should be checked?", choices: ["Switchport description", "Next-hop resolution and route-selection competition", "DHCP lease time", "The syslog facility"], answer: 1, explanation: "Unreachable next hops or a preferred route from another source can prevent BGP installation." }
  },
  "route-redistribution": {
    objective: "Redistribute between routing protocols with explicit metrics, tags, and loop prevention.",
    example: "An edge ASBR redistributes only approved branch prefixes and attaches a route tag so those routes cannot be reintroduced on the opposite boundary.",
    deepDive: [
      "Redistribution imports routes from one source protocol into another and requires a seed metric or protocol-specific default. Route attributes may not transfer directly, so metric, route type, and administrative preference need deliberate design.",
      "Bidirectional redistribution can create feedback loops, suboptimal paths, and route explosions. Prefix filters, route tags, route maps, and clear ownership of prefixes prevent a route from returning to its origin.",
      "Start with an explicit prefix allowlist, assign and match tags consistently at every boundary, and verify route type, metric, next hop, and return path. Test failure and recovery before scaling beyond a lab."
    ],
    lab: {
      title: "Prevent a redistribution feedback loop",
      scenario: "OSPF and EIGRP exchange routes at two edges and some prefixes repeatedly reappear as external routes.",
      steps: ["Identify route origin, current protocol, external metric/type, and boundary path.", "Apply a narrow prefix policy and set a route tag when importing routes.", "Block tagged routes on the reverse redistribution and verify both route tables."],
      check: "What is a route tag useful for in redistribution policy?",
      choices: ["Encrypting routing updates", "Recognizing and preventing a route from being reintroduced", "Choosing the STP root", "Assigning a DHCP address"],
      explanation: "Route tags carry policy metadata that can identify routes at subsequent redistribution boundaries and prevent feedback.",
      command: "route-map OSPF-TO-EIGRP permit 10\n match ip address prefix-list OSPF-EXPORT\n set tag 110\nrouter eigrp 100\n redistribute ospf 10 route-map OSPF-TO-EIGRP"
    },
    quiz: { prompt: "How can route tags help prevent redistribution feedback?", choices: ["By changing the IP TTL", "By marking imported routes so a later boundary can filter them", "By encrypting the route", "By changing the VLAN"], answer: 1, explanation: "A tag lets policy recognize routes that have already crossed a redistribution boundary." }
  },
  "route-maps-prefix-policy": {
    objective: "Use prefix lists, route maps, and communities to implement readable routing policy.",
    example: "A prefix list matches the customer's exact /24, while a route map sets local preference and rejects longer prefixes before BGP advertisement.",
    deepDive: [
      "Prefix lists match address ranges and prefix lengths; route maps apply ordered permit/deny clauses and can match or set attributes. Sequence order and implicit outcomes matter, so use explicit, reviewable terms.",
      "BGP communities attach policy labels that peers or internal routers can match. Standard, extended, and large communities have different formats; community propagation and provider agreements determine whether a label has meaning.",
      "Test representative allowed, denied, more-specific, and default prefixes. Inspect policy counters and actual received/advertised routes; a syntactically valid route map that matches nothing can be worse than an explicit failure."
    ],
    lab: {
      title: "Filter customer advertisements",
      scenario: "A customer should advertise 203.0.113.0/24 only, never a more-specific route or default.",
      steps: ["Write exact prefix and length requirements, including the default-route case.", "Build a prefix list and attach it to the correct BGP neighbor direction.", "Inspect advertised routes and policy counters from the local and peer views."],
      check: "Why must prefix length be checked as well as the address range?",
      choices: ["To calculate Ethernet MTU", "To prevent unintended more-specific prefixes from matching", "To elect a DR", "To define the TCP port"],
      explanation: "A prefix list can match a range; controlling length prevents unintended more-specific advertisements.",
      command: "ip prefix-list CUSTOMER-OUT permit 203.0.113.0/24\nrouter bgp 65010\n neighbor 198.51.100.1 prefix-list CUSTOMER-OUT out"
    },
    quiz: { prompt: "What can an explicit prefix-length range prevent in a BGP prefix filter?", choices: ["OSPF adjacency", "Unintended more-specific announcements", "SNMP polling", "EtherChannel negotiation"], answer: 1, explanation: "Address and prefix-length matching together constrain which exact routes can pass." }
  },
  "policy-based-routing": {
    objective: "Steer selected traffic with policy-based routing while preserving safe fallback and verification.",
    example: "A branch sends a specified guest subnet to a security service chain while corporate traffic continues to follow the routing table.",
    deepDive: [
      "PBR matches selected packets using policy criteria and overrides normal destination-based route lookup for those packets. It is useful for service insertion or path steering but creates another forwarding decision to troubleshoot.",
      "Policies need explicit next-hop tracking or a safe fallback where supported; otherwise traffic can black-hole when the preferred next hop fails. ACL match scope, route-map order, direction, and interface attachment all matter.",
      "Check policy counters and platform hardware support, then test matching and nonmatching flows, next-hop failure, return path, and QoS/ACL interaction. Avoid broad matches that unintentionally steer routing or management traffic."
    ],
    lab: {
      title: "Steer guest traffic to a security service",
      scenario: "Guest traffic should traverse an inspection appliance; corporate traffic must use normal routing.",
      steps: ["Define a narrow source/destination match and exclude management/control traffic.", "Apply PBR only at the intended ingress and define reachable next-hop fallback behavior.", "Test guest and corporate flows, inspect counters, and simulate service-node failure."],
      check: "What does PBR do for a matching packet?",
      choices: ["Always floods it at Layer 2", "Overrides normal destination-based route selection according to policy", "Encrypts it automatically", "Assigns a new DHCP lease"],
      explanation: "PBR can steer matching traffic to a policy-selected next hop rather than the normal routing-table choice.",
      command: "route-map GUEST-STEER permit 10\n match ip address GUEST-SOURCES\n set ip next-hop 192.0.2.10\ninterface Vlan20\n ip policy route-map GUEST-STEER"
    },
    quiz: { prompt: "What does PBR change for traffic matching its policy?", choices: ["The source MAC address always", "The normal destination-based forwarding choice", "The VLAN database", "The OSPF LSA type"], answer: 1, explanation: "PBR selectively overrides normal routing-table forwarding for matched traffic." }
  },
  "vrf-route-leaking": {
    objective: "Implement controlled inter-VRF route exchange with explicit isolation and return-path policy.",
    example: "Two tenant VRFs import only DNS and monitoring service prefixes from a shared-services VRF, while tenant-to-tenant routes remain isolated.",
    deepDive: [
      "Route leaking deliberately shares selected reachability between otherwise separate VRFs. Methods depend on platform and design, including static routes, route targets in MPLS VPNs, or supported inter-VRF routing constructs.",
      "A leaked route does not automatically guarantee a working flow: return routes, firewall policy, overlapping prefixes, and source selection all matter. Broad bidirectional leaking can erase the isolation the VRF was intended to provide.",
      "Define allowed prefix and direction matrices, attach tags/communities where useful, and verify each VRF RIB plus the actual forwarding path. Review leak behavior during failover and after adding overlapping tenant prefixes."
    ],
    lab: {
      title: "Expose shared DNS without joining tenants",
      scenario: "Two tenant VRFs need access to a DNS service in a shared-services VRF but must remain isolated from one another.",
      steps: ["Document the exact DNS service prefix and permitted source/destination flows.", "Leak only required routes and enforce traffic policy at the service boundary.", "Inspect all VRF tables and test allowed DNS plus denied tenant-to-tenant traffic."],
      check: "Does importing a route into another VRF alone enforce application authorization?",
      choices: ["Yes, routes are firewalls", "No; route reachability must be paired with appropriate traffic policy", "Only for IPv6", "Only when using BGP"],
      explanation: "Route leaking provides reachability; ACL/firewall policy is still required to control which applications and flows are allowed.",
      command: "show ip route vrf TENANT-A\nshow ip route vrf SHARED-SERVICES"
    },
    quiz: { prompt: "What must accompany inter-VRF route leaking to preserve least-privilege access?", choices: ["A wider VLAN", "Explicit traffic policy and return-path validation", "A longer hostname", "An unfiltered default route"], answer: 1, explanation: "Routing shares reachability; security policy must still authorize only intended flows and returns." }
  },
  "ipv6-advanced-routing": {
    objective: "Troubleshoot OSPFv3, IPv6 route policy, link-local next hops, and ICMPv6 dependencies.",
    example: "An OSPFv3 neighbor is up over a /64 link, but a route is absent because the prefix was not enabled in the intended address family.",
    deepDive: [
      "OSPFv3 forms adjacencies using link-local addresses and carries IPv6 reachability through its LSAs; modern implementations may support multiple address families. Configuration and show commands vary by software generation.",
      "IPv6 routing policy uses IPv6 prefix lists and ACLs; IPv4 policy objects do not match IPv6. Neighbor Discovery, router advertisements, and Packet Too Big messages depend on ICMPv6 and must be allowed as appropriate.",
      "Check interface address family, link-local scope, OSPFv3 process/area, neighbor state, LSDB, IPv6 RIB/FIB, and policy. Use source-specific tests and verify return routes rather than inferring IPv6 health from dual-stack IPv4 results."
    ],
    lab: {
      title: "Restore an OSPFv3 route",
      scenario: "An IPv6 prefix is connected locally but absent at the remote router despite an established adjacency.",
      steps: ["Confirm the prefix is enabled for the intended IPv6 routing address family.", "Inspect OSPFv3 LSDB and route type, area, filtering, and next-hop scope.", "Check IPv6 ACL handling of required ICMPv6 and verify the return path."],
      check: "Why can a broad ICMPv6 deny break otherwise valid IPv6 routing?",
      choices: ["ICMPv6 is only for ping", "Neighbor Discovery and Packet Too Big depend on ICMPv6", "It disables IPv4 ARP", "It changes BGP local preference"],
      explanation: "ICMPv6 supports essential neighbor discovery and path-MTU signaling; indiscriminate blocking can break IPv6.",
      command: "show ipv6 ospf neighbor\nshow ipv6 ospf database\nshow ipv6 route"
    },
    quiz: { prompt: "Which essential IPv6 functions use ICMPv6 and can be broken by an indiscriminate deny?", choices: ["802.1Q tagging", "Neighbor Discovery and Packet Too Big signaling", "OSPFv2 only", "TCP retransmission"], answer: 1, explanation: "IPv6 Neighbor Discovery and Path MTU Discovery rely on ICMPv6 messages." }
  },
  "ipsec-site-to-site": {
    objective: "Trace IKE negotiation, IPsec security associations, selectors, and encrypted data-plane traffic.",
    example: "Two branch peers establish IKEv2, negotiate compatible proposals, and encrypt traffic between 10.10.0.0/16 and 10.20.0.0/16.",
    deepDive: [
      "IKE authenticates peers and negotiates parameters; IPsec security associations protect matching data traffic. IKE and IPsec use different ports/protocols and have separate state that must be inspected.",
      "Peers must agree on identity, authentication, proposals, lifetimes, traffic selectors, and reachable underlay addresses. NAT traversal, overlapping subnets, and mismatched proxy IDs/selectors commonly prevent data SAs even when IKE is partially established.",
      "Protect keys and certificates, prefer modern supported cryptographic suites, and verify counters increase in both directions. A tunnel showing up does not prove the intended subnets are included or that return routing and firewall policy work."
    ],
    lab: {
      title: "Diagnose an idle site-to-site VPN",
      scenario: "IKE is established but the protected application subnet has no working traffic.",
      steps: ["Compare peer identity, proposals, selectors, and the intended local/remote prefixes.", "Generate matching traffic and inspect IPsec SA counters and encapsulation/decapsulation.", "Check NAT exemption, routing, firewall policy, and the protected subnet's return path."],
      check: "What does an IKE SA prove by itself?",
      choices: ["Every application subnet is reachable", "The peers negotiated a control relationship, not necessarily working data selectors", "The LAN has DHCP", "The tunnel is immune to MTU issues"],
      explanation: "IKE control state can exist while data selectors, routing, NAT, or security policy still prevent application traffic.",
      command: "show crypto ikev2 sa\nshow crypto ipsec sa"
    },
    quiz: { prompt: "IKE is up but the protected subnet fails. Which evidence best confirms data-plane encryption?", choices: ["The hostname resolves", "IPsec encapsulation and decapsulation counters increase for matching traffic", "The NTP clock is correct", "The STP root is stable"], answer: 1, explanation: "IPsec SA counters show whether matching traffic is actually encrypted and decrypted." }
  },
  "gre-ipsec-overlay": {
    objective: "Combine GRE and IPsec when dynamic routing or multicast must cross an encrypted overlay.",
    example: "GRE carries OSPF multicast between branches while IPsec protects the GRE packets across the public underlay.",
    deepDive: [
      "GRE supplies a logical tunnel that can carry routing protocols and multicast; IPsec provides confidentiality, integrity, and peer authentication according to the negotiated profile. Encapsulation order and platform support affect configuration.",
      "The outer peer addresses must remain reachable without relying on the protected tunnel itself, avoiding recursive routing. Added GRE and IPsec headers reduce usable MTU and can create fragmentation or TCP MSS problems.",
      "Verify underlay route, tunnel interface, IKE/IPsec state, matching selectors, routing adjacency over the tunnel, and end-to-end MTU. Protect secrets and confirm traffic counters and failover behavior before relying on the overlay."
    ],
    lab: {
      title: "Build a protected routing overlay",
      scenario: "Two sites need OSPF adjacency over GRE while all tunnel traffic is encrypted across the internet.",
      steps: ["Verify each outer peer address has an independent underlay route.", "Configure matching GRE endpoints and IPsec protection using a supported profile.", "Check IKE/IPsec counters, tunnel MTU, OSPF neighbor, and application path."],
      check: "Why must the GRE/IPsec peer destination be reachable outside the tunnel?",
      choices: ["To disable routing", "To prevent recursive dependence on the tunnel being established", "To share an STP root", "To assign a DHCP address"],
      explanation: "The tunnel's outer packets need an underlay path; routing the peer only through the tunnel can create recursion.",
      command: "show ip route 198.51.100.2\nshow interface Tunnel10\nshow crypto ipsec sa"
    },
    quiz: { prompt: "What is the purpose of GRE plus IPsec in a routed overlay?", choices: ["GRE encrypts; IPsec provides multicast", "GRE carries the logical traffic; IPsec protects it", "Both only provide DHCP", "IPsec elects the OSPF DR"], answer: 1, explanation: "GRE provides encapsulation and protocol carriage; IPsec adds cryptographic protection." }
  },
  "dmvpn": {
    objective: "Explain DMVPN hub/spoke operation, NHRP mappings, and dynamic spoke-to-spoke tunnels.",
    example: "Two branches initially reach each other through a hub; NHRP resolves the remote tunnel endpoint and creates a direct spoke path for later traffic.",
    deepDive: [
      "DMVPN combines multipoint GRE, NHRP mapping, and commonly IPsec to support hub-and-spoke overlays with dynamic spoke-to-spoke shortcuts. The hub provides initial registration and reachability information.",
      "Routing protocol design, NHRP network IDs, tunnel keys, IPsec profiles, and next-hop handling must align. Phase behavior determines whether traffic remains hub-and-spoke or can form direct dynamic paths; platform support varies.",
      "Troubleshoot underlay reachability, NHRP registration and mappings, IPsec SAs, tunnel interface state, routing neighbors, and shortcut creation separately. Protect the hub as a critical dependency and test spoke loss and scale."
    ],
    lab: {
      title: "Trace a DMVPN spoke shortcut",
      scenario: "Spoke A reaches the hub but cannot form a direct tunnel to Spoke B.",
      steps: ["Confirm each spoke's public/NBMA reachability and hub registration.", "Inspect NHRP mappings, routing next hops, and IPsec peer state.", "Generate spoke-to-spoke traffic and verify whether a shortcut is supported and established."],
      check: "Which protocol resolves overlay next-hop information to a DMVPN tunnel endpoint?",
      choices: ["DNS", "NHRP", "STP", "SNMP"],
      explanation: "NHRP maps overlay addresses to NBMA/tunnel endpoints and supports dynamic spoke discovery.",
      command: "show dmvpn\nshow ip nhrp\nshow crypto ipsec sa"
    },
    quiz: { prompt: "What does NHRP provide in a DMVPN design?", choices: ["Ethernet loop prevention", "Mappings between overlay addresses and tunnel endpoints", "A DHCP lease", "BGP encryption"], answer: 1, explanation: "NHRP resolves overlay next hops to NBMA endpoints for DMVPN connectivity." }
  },
  "mpls-l3vpn": {
    objective: "Describe VRFs, route distinguishers, route targets, and label forwarding in an MPLS L3VPN.",
    example: "Two customer VRFs reuse 10.0.0.0/8; route distinguishers make VPNv4 routes unique and route targets control which VRFs import them.",
    deepDive: [
      "An MPLS L3VPN uses provider-edge VRFs for customer separation, MP-BGP VPN address families to carry VPN routes, and labels to direct packets across the provider core. Provider core routers need label-switched reachability, not every customer route.",
      "A route distinguisher makes an otherwise overlapping IPv4 prefix unique in VPNv4; it is not a security policy. Route targets are extended communities used to control VPN route import/export and therefore define reachability relationships.",
      "Troubleshoot customer interface/VRF, PE-CE routing, VPNv4 route and RT policy, label bindings, provider transport, and remote PE import separately. Validate isolation and return paths, and treat label/RT design as platform and provider-specific."
    ],
    lab: {
      title: "Restore a customer VPN route",
      scenario: "A prefix appears at the ingress PE but not in the remote customer VRF.",
      steps: ["Verify local VRF and PE-CE route installation and export policy.", "Inspect VPNv4 route, route target, next-hop reachability, and label allocation.", "Confirm remote VRF imports the intended RT and test customer forwarding both ways."],
      check: "What does a route distinguisher do?",
      choices: ["Encrypt customer packets", "Make overlapping VPN prefixes unique in the VPN routing address family", "Select the OSPF root", "Assign an IPv6 link-local address"],
      explanation: "The RD creates a unique VPNv4 route identity; RT policy controls which VRFs import/export routes.",
      command: "show ip route vrf CUSTOMER-A\nshow bgp vpnv4 unicast all\nshow mpls forwarding-table"
    },
    quiz: { prompt: "In an MPLS L3VPN, what controls which VPN routes a VRF imports?", choices: ["The route distinguisher alone", "Route-target import policy", "The Ethernet native VLAN", "The OSPF DR"], answer: 1, explanation: "Route targets control VPN route import/export; the RD makes VPN route keys unique." }
  },
  "infrastructure-acls": {
    objective: "Secure the management and routing infrastructure with narrow, direction-aware policy.",
    example: "A management ACL permits SSH and SNMP only from the operations subnet while allowing required routing neighbors on transit links.",
    deepDive: [
      "Infrastructure security protects device management, routing adjacencies, and services rather than only user-to-server traffic. Control-plane filters, interface ACLs, management VRFs, and dedicated access paths have different scopes.",
      "Build an explicit source/destination/protocol matrix for SSH, SNMP, NTP, DNS, TACACS+/RADIUS, routing protocols, and telemetry. A broad deny can silently break control traffic; a broad permit expands the attack surface.",
      "Apply changes with console/out-of-band access, staged tests, counters, and rollback. Validate from both authorized and unauthorized sources and confirm control-plane neighbors and monitoring remain healthy."
    ],
    lab: {
      title: "Restrict management-plane access",
      scenario: "Only the NOC subnet may SSH to routers, but OSPF and SNMP monitoring must continue.",
      steps: ["Inventory authorized management sources and required control/monitoring protocols.", "Apply a narrow management-plane ACL at the correct boundary and direction.", "Test NOC access, unauthorized access denial, OSPF adjacency, and SNMP polling."],
      check: "Why should a management ACL change be staged with console or out-of-band access?",
      choices: ["To increase route metrics", "To recover safely if the policy blocks the administrator", "To form an EtherChannel", "To replace AAA"],
      explanation: "A misapplied management ACL can lock out remote operators; console or out-of-band access preserves recovery.",
      command: "ip access-list standard NOC-MGMT\n permit 192.0.2.0 0.0.0.255\n deny any log\nline vty 0 4\n access-class NOC-MGMT in"
    },
    quiz: { prompt: "What is a key safeguard before applying a remote-management ACL?", choices: ["Disable the console", "Preserve console/out-of-band recovery and test required control traffic", "Permit all sources temporarily forever", "Remove AAA"], answer: 1, explanation: "A narrow policy can still lock out operators; retain recovery and verify both management and control protocols." }
  },
  "enarsi-aaa-hardening": {
    objective: "Harden privileged access with centralized AAA, role separation, secure management, and audited fallback.",
    example: "An operations team uses TACACS+ command authorization over a management VRF, while a sealed local account is reserved for audited console recovery.",
    deepDive: [
      "A network device's management plane should be reachable only from approved administration sources and use encrypted protocols such as SSH and SNMPv3. AAA policies separate identity verification, privilege assignment, and audit records.",
      "TACACS+ commonly supports command-level authorization; RADIUS is widely used for network access. Central servers need redundant reachability and protected secrets. Local fallback must be least-privilege and tested without becoming an undocumented shared password.",
      "Verify successful and denied logins, role/command boundaries, accounting delivery, management ACL counters, and behavior during a server timeout. Keep console or out-of-band recovery and change authentication policies in a controlled sequence."
    ],
    lab: {
      title: "Harden a remote router's management access",
      scenario: "Only the NOC may use SSH; TACACS+ must authorize roles, accounting must reach the collector, and console recovery must remain available.",
      steps: ["Check AAA server reachability, encrypted management transport, source ACL, and time synchronization.", "Test role-based command permits/denials and verify accounting records at the collector.", "Simulate AAA timeout from console and confirm the approved emergency account and rollback path."],
      check: "What should a management-plane ACL change retain during rollout?",
      choices: ["An unauthenticated VTY line", "A tested console or out-of-band recovery path", "A shared public password", "An any-any permit"],
      explanation: "An ACL or AAA mistake can remove remote access; tested console/out-of-band recovery keeps changes reversible.",
      command: "show aaa servers\nshow users\nshow access-lists"
    },
    quiz: { prompt: "What is the safest way to stage a remote management ACL or AAA change?", choices: ["Apply it to every device at once", "Keep tested console/out-of-band access and verify one pilot first", "Disable logging and accounting", "Use an any-any permit permanently"], answer: 1, explanation: "A pilot and tested recovery path limit lockout risk while validating authentication, authorization, and policy." }
  },
  "urpf-copp-security": {
    objective: "Use uRPF and CoPP with awareness of asymmetric routing and control-plane dependencies.",
    example: "A branch applies feasible-path uRPF on an internet-facing interface after confirming expected asymmetric traffic will not be falsely discarded.",
    deepDive: [
      "Unicast Reverse Path Forwarding checks whether a packet's source is reachable through an expected interface according to the routing table. Strict mode can drop legitimate traffic on asymmetric paths; loose or feasible-path modes have different spoofing and false-positive trade-offs.",
      "CoPP protects CPU-bound traffic with classification and rate control; uRPF checks transit packet source plausibility. They protect different planes and should not be substituted for one another.",
      "Model routing asymmetry, default routes, multihoming, and legitimate tunnels before enabling enforcement. Start with counters or supported non-dropping observation, then monitor drops and routing/management health during staged activation."
    ],
    lab: {
      title: "Evaluate source validation safely",
      scenario: "A dual-homed edge wants to reduce spoofed source traffic without dropping valid asymmetric return paths.",
      steps: ["Map expected forward/return paths and inspect the source-prefix routing entries.", "Choose uRPF mode appropriate to asymmetry and supported platform behavior.", "Observe counters, test known asymmetric flows, and only then enable the planned enforcement."],
      check: "Why can strict uRPF drop legitimate traffic on a multihomed network?",
      choices: ["It changes the destination port", "The best reverse path may use a different interface than the packet arrived on", "It blocks all IPv6", "It disables BGP sessions"],
      explanation: "Strict mode expects the reverse route to use the ingress interface; asymmetric routing can violate that expectation.",
      command: "show ip interface\nshow policy-map control-plane"
    },
    quiz: { prompt: "What is a risk of strict uRPF on an asymmetric multihomed edge?", choices: ["It rewrites DNS", "Legitimate packets may arrive on an interface other than the best reverse path", "It disables Ethernet autonegotiation", "It changes the OSPF process ID"], answer: 1, explanation: "Strict uRPF assumes the best route back to the source uses the ingress interface; asymmetry can cause false drops." }
  },
  "dhcp-relay-services": {
    objective: "Troubleshoot DHCP relay across routed VLANs, including helper forwarding and return delivery.",
    example: "A user VLAN's SVI relays DHCP broadcasts to two server unicast addresses; the server selects the scope using the relay gateway address.",
    deepDive: [
      "DHCP discovery begins as a local broadcast that routers do not normally forward. A relay agent forwards requests to configured servers and supplies relay information such as the gateway address so the server can select the correct scope.",
      "The relay source/interface, server route back, helper ACLs, Option 82 policy, and DHCP scope all affect the exchange. A working server ping does not prove UDP DHCP exchanges and return broadcasts are permitted.",
      "Capture or inspect Discover/Offer/Request/Ack stages, relay counters, bindings, and server logs. Validate multiple helper targets and failover behavior without broadening access unnecessarily."
    ],
    lab: {
      title: "Restore DHCP on a remote VLAN",
      scenario: "Clients in VLAN 40 cannot lease addresses, but the DHCP server is reachable from the core.",
      steps: ["Verify SVI state, helper target, relay source, and client VLAN broadcast arrival.", "Check routing and ACLs for UDP 67/68 plus server scope and relay metadata.", "Observe a full DORA exchange and confirm the lease and gateway options."],
      check: "Why is a DHCP relay needed between a client VLAN and a remote server?",
      choices: ["DHCP uses TCP", "The relay forwards client broadcasts across routed boundaries", "The relay encrypts DNS", "It replaces the default gateway"],
      explanation: "Routers do not normally forward local DHCP broadcasts; a relay converts/forwards requests to a remote server.",
      command: "interface Vlan40\n ip helper-address 192.0.2.50\nshow ip dhcp relay information"
    },
    quiz: { prompt: "What does a DHCP relay do for clients on a routed VLAN?", choices: ["Route spanning-tree BPDUs", "Forward local DHCP broadcasts to remote servers", "Translate hostnames to IPs", "Encrypt the lease"], answer: 1, explanation: "A relay forwards DHCP requests across the routed boundary and helps the server select the right scope." }
  },
  "infrastructure-operations": {
    objective: "Correlate NTP, syslog, SNMP, IP SLA, and flow data during an infrastructure incident.",
    example: "An operator aligns NTP timestamps across routers, finds a link-flap syslog event, confirms loss with IP SLA, and correlates interface telemetry.",
    deepDive: [
      "Operational services are most useful together: NTP aligns event time, syslog records state changes, SNMP/telemetry provide counters, IP SLA measures synthetic reachability, and flow data shows traffic patterns.",
      "Each data source has coverage limits and possible failure modes. A collector may be unreachable, polling may be too slow, timestamps may be skewed, and synthetic probes may not represent a user transaction.",
      "Build a timeline from synchronized sources, preserve raw evidence, check collector health and device time, then correlate with topology and change records. Protect management services and retain only data needed for operations."
    ],
    lab: {
      title: "Build an incident timeline",
      scenario: "Users report packet loss beginning sometime during a maintenance window.",
      steps: ["Confirm device and collector time synchronization, then bound the incident interval.", "Correlate syslog link/routing events with IP SLA loss, interface errors, and flow telemetry.", "Identify the first observable fault and verify recovery with both synthetic and user-path tests."],
      check: "Why is synchronized NTP important when correlating device logs?",
      choices: ["It increases link bandwidth", "It makes event timestamps comparable across devices", "It changes BGP attributes", "It enables VLAN tagging"],
      explanation: "Consistent time lets operators order events from different devices and compare them with monitoring and change records.",
      command: "show clock detail\nshow ntp associations\nshow logging"
    },
    quiz: { prompt: "What is the main operational value of synchronizing device clocks?", choices: ["Encrypting logs", "Correlating events across devices by time", "Preventing VLAN loops", "Creating default routes"], answer: 1, explanation: "Consistent timestamps make cross-device incident timelines meaningful." }
  },
  "ipv6-first-hop-security": {
    objective: "Recognize IPv6 first-hop threats and apply platform-supported RA, DHCPv6, and neighbor protections.",
    example: "A managed access switch blocks rogue router advertisements on untrusted edge ports while preserving advertisements from the authorized gateway.",
    deepDive: [
      "IPv6 hosts learn routers and prefixes using Router Advertisements; DHCPv6 may provide additional configuration. Rogue RA or DHCPv6 messages can redirect traffic or supply malicious resolver settings.",
      "First-hop security features can validate RA, DHCPv6, neighbor discovery, or source bindings, but names and support differ by platform/software. Features often depend on snooping state, trusted-port roles, and correctly designed VLAN boundaries.",
      "Inventory legitimate routers, relays, static hosts, and host behavior before enforcing. Test address autoconfiguration, neighbor reachability, failover, and logging; indiscriminate ICMPv6 filtering can break normal operation."
    ],
    lab: {
      title: "Contain a rogue router advertisement",
      scenario: "A test host receives an unexpected IPv6 default router on an access VLAN.",
      steps: ["Capture the RA source MAC, switch port, advertised prefix, and router lifetime.", "Compare the source port with the approved gateway and enable supported RA guard policy.", "Verify legitimate router failover and client autoconfiguration still work."],
      check: "What can a rogue IPv6 Router Advertisement change for a host?",
      choices: ["Only its Ethernet speed", "Default-router and prefix configuration", "Its OSPF process ID", "Its VLAN trunk native ID"],
      explanation: "RAs advertise on-link prefixes and default-router information, so rogue messages can redirect hosts.",
      command: "show ipv6 neighbors\nshow ipv6 interface"
    },
    quiz: { prompt: "What is a likely impact of a rogue IPv6 Router Advertisement?", choices: ["It changes BGP local preference", "It can alter a host's default router or prefix information", "It changes the switch serial number", "It disables DHCPv4 on every subnet"], answer: 1, explanation: "Hosts use RAs to learn IPv6 prefixes and default-router information." }
  },
  "routing-troubleshooting": {
    objective: "Diagnose advanced routing faults using protocol state, RIB/FIB, policy, and end-to-end tests.",
    example: "A prefix is in the BGP table but absent from the FIB because its next hop is unresolved through an OSPF design change.",
    deepDive: [
      "Separate protocol learning from route selection and forwarding: a prefix may exist in a protocol database, lose RIB selection, or fail to program the forwarding plane. Check each layer instead of treating 'route present' as a single state.",
      "Inspect adjacency, received/filtered routes, attributes/metrics, administrative preference, next-hop recursion, policy counters, and interface health. Then trace forward and return paths through ACL, NAT, VRF, and MTU boundaries.",
      "Use sourced probes, traceroute, platform forwarding lookups, and packet captures when available. Change one root cause at a time, retain rollback, and validate the real application and failover path after repair."
    ],
    lab: {
      title: "Trace a missing route to the FIB",
      scenario: "A route appears in a routing protocol database but users cannot forward traffic to it.",
      steps: ["Compare protocol RIB, global/VRF routing table, and hardware forwarding lookup.", "Check route preference, recursive next hop, policy, adjacency, and output interface state.", "Test source-specific forward/return traffic and verify service recovery after the change."],
      check: "What does a route in a protocol database but not the forwarding table suggest?",
      choices: ["The application is certainly healthy", "Selection, recursion, policy, or programming may prevent forwarding", "The host needs a new MAC address only", "The route is encrypted"],
      explanation: "Protocol knowledge is only one stage; RIB selection, next-hop resolution, and FIB programming determine forwarding.",
      command: "show ip route 203.0.113.0\nshow ip cef 203.0.113.10 detail\nshow ip bgp 203.0.113.0"
    },
    quiz: { prompt: "A prefix exists in BGP but traffic does not forward. Which layers should be compared?", choices: ["Only DNS", "Protocol table, routing table, FIB, and end-to-end policy/path", "Only STP", "Only NTP"], answer: 1, explanation: "Compare learned route, selected route, programmed forwarding entry, next hop, and both traffic directions." }
  }
};

const domains: Omit<Domain, "topics">[] = [
  { id: "encor-architecture", title: "ENCOR · Architecture", weight: 15, color: "#477F9B", icon: "git-network-outline", exam: "ENCOR" },
  { id: "encor-virtualization", title: "ENCOR · Virtualization", weight: 10, color: "#6B70D6", icon: "layers-outline", exam: "ENCOR" },
  { id: "encor-infrastructure", title: "ENCOR · Infrastructure", weight: 30, color: "#E98B3D", icon: "hardware-chip-outline", exam: "ENCOR" },
  { id: "encor-assurance", title: "ENCOR · Network Assurance", weight: 10, color: "#26A58A", icon: "analytics-outline", exam: "ENCOR" },
  { id: "encor-security", title: "ENCOR · Security", weight: 20, color: "#E45D6A", icon: "shield-checkmark-outline", exam: "ENCOR" },
  { id: "encor-automation", title: "ENCOR · Automation", weight: 15, color: "#477F9B", icon: "code-slash-outline", exam: "ENCOR" },
  { id: "enarsi-layer3", title: "ENARSI · Layer 3 Technologies", weight: 35, color: "#E98B3D", icon: "navigate-outline", exam: "ENARSI" },
  { id: "enarsi-vpn", title: "ENARSI · VPN Technologies", weight: 20, color: "#6B70D6", icon: "lock-closed-outline", exam: "ENARSI" },
  { id: "enarsi-security", title: "ENARSI · Infrastructure Security", weight: 20, color: "#E45D6A", icon: "shield-checkmark-outline", exam: "ENARSI" },
  { id: "enarsi-services", title: "ENARSI · Infrastructure Services", weight: 25, color: "#26A58A", icon: "cloud-outline", exam: "ENARSI" }
];

const domainTopicIds: Record<string, string[]> = {
  "encor-architecture": ["enterprise-architecture", "campus-fabric", "sdwan-architecture", "cloud-connectivity"],
  "encor-virtualization": ["vrf-lite", "gre-tunnels", "vxlan-overlay", "hypervisor-networking"],
  "encor-infrastructure": ["advanced-vlan-trunking", "spanning-tree-tuning", "etherchannel-lacp", "ospf-design", "fhrp-gateway-redundancy", "bfd-fast-failover", "eigrp-fundamentals", "bgp-enterprise-edge", "ipv6-enterprise-routing", "multicast-fundamentals", "qos-architecture", "wireless-enterprise-design"],
  "encor-assurance": ["telemetry-netflow", "snmpv3-syslog", "span-erspan", "ip-sla-object-tracking", "troubleshooting-method"],
  "encor-security": ["aaa-tacacs-radius", "dot1x-access-control", "trustsec-macsec", "control-plane-policing", "layer2-hardening", "ipv4-ipv6-acl-policy"],
  "encor-automation": ["netconf-restconf-yang", "network-json-data", "python-network-apis", "ansible-network-automation", "event-driven-automation", "catalyst-center-automation"],
  "enarsi-layer3": ["ospf-multi-area", "ospf-lsa-filtering", "eigrp-advanced", "bgp-path-policy", "route-redistribution", "route-maps-prefix-policy", "policy-based-routing", "vrf-route-leaking", "ipv6-advanced-routing"],
  "enarsi-vpn": ["ipsec-site-to-site", "gre-ipsec-overlay", "dmvpn", "mpls-l3vpn"],
  "enarsi-security": ["infrastructure-acls", "enarsi-aaa-hardening", "urpf-copp-security"],
  "enarsi-services": ["dhcp-relay-services", "infrastructure-operations", "ipv6-first-hop-security", "routing-troubleshooting"]
};

const topicTitles: Record<string, string> = {
  "enterprise-architecture": "Enterprise architecture and campus design",
  "campus-fabric": "Cisco SD-Access fabric architecture",
  "sdwan-architecture": "SD-WAN architecture and path policy",
  "cloud-connectivity": "Hybrid and cloud connectivity",
  "vrf-lite": "VRF-Lite and routing-table segmentation",
  "gre-tunnels": "GRE tunnels and overlay reachability",
  "vxlan-overlay": "VXLAN, VTEPs, and overlay segments",
  "hypervisor-networking": "Virtual switches and hypervisor networking",
  "advanced-vlan-trunking": "Advanced VLAN and 802.1Q trunk design",
  "spanning-tree-tuning": "STP root design and loop protection",
  "etherchannel-lacp": "LACP EtherChannel design and troubleshooting",
  "ospf-design": "Enterprise OSPF design and troubleshooting",
  "fhrp-gateway-redundancy": "FHRP gateway redundancy and tracking",
  "bfd-fast-failover": "BFD and fast failure detection",
  "eigrp-fundamentals": "EIGRP DUAL, successors, and metrics",
  "bgp-enterprise-edge": "BGP enterprise edge and peering policy",
  "ipv6-enterprise-routing": "Enterprise IPv6 and dual-stack routing",
  "multicast-fundamentals": "Multicast, IGMP, PIM, and RPF",
  "qos-architecture": "QoS classification, marking, and queuing",
  "wireless-enterprise-design": "Enterprise WLAN design and operations",
  "telemetry-netflow": "Flow telemetry and network analytics",
  "snmpv3-syslog": "Secure SNMPv3 and syslog operations",
  "span-erspan": "SPAN, ERSPAN, and packet visibility",
  "ip-sla-object-tracking": "IP SLA, object tracking, and failover",
  "troubleshooting-method": "Evidence-driven network troubleshooting",
  "aaa-tacacs-radius": "AAA, TACACS+, and RADIUS",
  "trustsec-macsec": "TrustSec, security groups, and MACsec",
  "dot1x-access-control": "802.1X access control and RADIUS",
  "control-plane-policing": "Control-plane protection and CoPP",
  "layer2-hardening": "Layer 2 hardening and DHCP snooping",
  "ipv4-ipv6-acl-policy": "IPv4 and IPv6 ACL policy",
  "netconf-restconf-yang": "NETCONF, RESTCONF, and YANG",
  "network-json-data": "JSON data models and validation",
  "python-network-apis": "Python and network APIs",
  "ansible-network-automation": "Ansible network automation",
  "event-driven-automation": "Event-driven network automation",
  "catalyst-center-automation": "Catalyst Center and campus automation",
  "ospf-multi-area": "Advanced OSPF multi-area operations",
  "ospf-lsa-filtering": "OSPF LSA types and route filtering",
  "eigrp-advanced": "Advanced EIGRP named mode and variance",
  "bgp-path-policy": "Advanced BGP path selection and policy",
  "route-redistribution": "Route redistribution and loop prevention",
  "route-maps-prefix-policy": "Route maps, prefix lists, and communities",
  "policy-based-routing": "Policy-based routing and traffic steering",
  "vrf-route-leaking": "Inter-VRF route leaking and policy",
  "ipv6-advanced-routing": "Advanced IPv6 routing and OSPFv3",
  "ipsec-site-to-site": "Site-to-site IPsec and IKE",
  "gre-ipsec-overlay": "GRE over IPsec routed overlays",
  dmvpn: "DMVPN, NHRP, and spoke connectivity",
  "mpls-l3vpn": "MPLS L3VPN, VRFs, RDs, and RTs",
  "infrastructure-acls": "Infrastructure and management-plane security",
  "enarsi-aaa-hardening": "ENARSI AAA and device hardening",
  "urpf-copp-security": "uRPF and control-plane security",
  "dhcp-relay-services": "DHCP relay across routed networks",
  "infrastructure-operations": "NTP, syslog, SNMP, and service assurance",
  "ipv6-first-hop-security": "IPv6 first-hop security",
  "routing-troubleshooting": "Advanced routing and forwarding troubleshooting"
};

export const ccnpCurriculum: Domain[] = domains.map((domain) => ({
  ...domain,
  topics: domainTopicIds[domain.id].map((id) => {
    const seed = seeds[id];
    if (!seed) throw new Error(`Missing CCNP lesson data for ${id}`);
    const title = topicTitles[id];
    if (!title) throw new Error(`Missing CCNP topic title for ${id}`);
    return { id, title, explanation: seed.deepDive[0], example: seed.example };
  })
}));

function diagramFor(id: string): LessonContent["diagram"] {
  if (/ospf|eigrp|bgp|routing|route-|ipv6|bfd|fhrp/.test(id)) {
    return { caption: "Follow route learning, selection, and packet forwarding.", nodes: [
      { title: "Neighbor", subtitle: "Form protocol relationship" }, { title: "Policy", subtitle: "Filter and set attributes" },
      { title: "RIB", subtitle: "Select the best route" }, { title: "FIB", subtitle: "Resolve next hop and forward" }
    ] };
  }
  if (/security|aaa|dot1x|acl|trustsec|macsec|urpf|control-plane/.test(id)) {
    return { caption: "Make an identity-aware decision at the correct enforcement point.", nodes: [
      { title: "Identity", subtitle: "Authenticate source" }, { title: "Context", subtitle: "Role, subnet, or protocol" },
      { title: "Policy", subtitle: "Ordered allow/deny decision" }, { title: "Evidence", subtitle: "Counters and audit log" }
    ] };
  }
  if (/vpn|gre|dmvpn|mpls|ipsec|vxlan|vrf|virtualization|hypervisor/.test(id)) {
    return { caption: "Separate the routed transport from the logical overlay.", nodes: [
      { title: "Underlay", subtitle: "Reachable transport path" }, { title: "Tunnel/VRF", subtitle: "Build logical separation" },
      { title: "Route/policy", subtitle: "Advertise intended prefixes" }, { title: "Service", subtitle: "Verify both directions" }
    ] };
  }
  if (/automation|json|api|yang|ansible|catalyst-center/.test(id)) {
    return { caption: "Turn verified intent into a reviewable, observable change.", nodes: [
      { title: "Inventory", subtitle: "Scope target devices" }, { title: "Model/API", subtitle: "Read or express intent" },
      { title: "Review", subtitle: "Validate and approve diff" }, { title: "Verify", subtitle: "Compare live state" }
    ] };
  }
  if (/telemetry|snmp|syslog|span|assurance|sla|troubleshooting/.test(id)) {
    return { caption: "Correlate independent evidence before changing the network.", nodes: [
      { title: "Signal", subtitle: "Counters, event, or probe" }, { title: "Correlate", subtitle: "Time and topology context" },
      { title: "Hypothesis", subtitle: "Test one cause" }, { title: "Outcome", subtitle: "Verify and document" }
    ] };
  }
  if (/vlan|spanning|etherchannel|switch|layer2/.test(id)) {
    return { caption: "Follow a frame across access, switching, and gateway boundaries.", nodes: [
      { title: "Endpoint", subtitle: "Source MAC and VLAN" }, { title: "Access", subtitle: "Port role and security" },
      { title: "Uplink", subtitle: "Trunk or port channel" }, { title: "Gateway", subtitle: "Route or contain frame" }
    ] };
  }
  if (/wireless|campus|sdwan|cloud|enterprise-architecture/.test(id)) {
    return { caption: "Connect the access edge, transport, policy, and application.", nodes: [
      { title: "Requirement", subtitle: "Availability and experience" }, { title: "Edge", subtitle: "User or branch access" },
      { title: "Transport", subtitle: "Underlay and alternate path" }, { title: "Service", subtitle: "Policy and application" }
    ] };
  }
  return { caption: "Follow design intent through configuration to verified operation.", nodes: [
    { title: "Intent", subtitle: "Define expected behavior" }, { title: "Configure", subtitle: "Apply a scoped change" },
    { title: "Verify", subtitle: "Check device and path state" }, { title: "Operate", subtitle: "Monitor and recover" }
  ] };
}

function toLesson(id: string, seed: LessonSeed): LessonContent {
  return {
    learningObjectives: [seed.objective, "Explain the design trade-offs and verify the behavior using device evidence."],
    deepDive: seed.deepDive,
    diagram: diagramFor(id),
    lab: {
      ...seed.lab,
      answer: 1
    }
  };
}

export const ccnpLessonContent: Record<string, LessonContent> = Object.fromEntries(
  Object.entries(seeds).map(([id, seed]) => [id, toLesson(id, seed)])
);

export const ccnpQuizBank: Record<string, QuizQuestion> = Object.fromEntries(
  Object.entries(seeds).map(([id, seed]) => [id, seed.quiz])
);
