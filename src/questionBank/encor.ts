import type { AssessmentOption, AssessmentQuestion } from "../assessmentTypes";

type ChoiceSeed = { text: string; explanation: string };
type ChoiceQuad = [ChoiceSeed, ChoiceSeed, ChoiceSeed, ChoiceSeed];
type OptionQuad = [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption];
type Index = 0 | 1 | 2 | 3;
type IndexPair = [Index, Index];
type IndexQuad = [Index, Index, Index, Index];
type QuestionGroup = {
  id: string;
  singles: AssessmentQuestion[];
  multi: AssessmentQuestion[];
  ordering: AssessmentQuestion;
  simlet: AssessmentQuestion;
};

const four = <T,>(a: T, b: T, c: T, d: T): [T, T, T, T] => [a, b, c, d];

function optionQuad(questionId: string, choices: ChoiceQuad): OptionQuad {
  return four(
    { id: `${questionId}-a`, ...choices[0] },
    { id: `${questionId}-b`, ...choices[1] },
    { id: `${questionId}-c`, ...choices[2] },
    { id: `${questionId}-d`, ...choices[3] }
  );
}

function optionId(options: OptionQuad, index: Index): string {
  switch (index) {
    case 0: return options[0].id;
    case 1: return options[1].id;
    case 2: return options[2].id;
    case 3: return options[3].id;
  }
  throw new Error("Invalid option index");
}

const choice = (text: string, explanation: string): ChoiceSeed => ({ text, explanation });

function single(
  topicId: string,
  number: number,
  prompt: string,
  answer: Index,
  choices: ChoiceQuad
): AssessmentQuestion {
  const id = `${topicId}-single-${number}`;
  const options = optionQuad(id, choices);
  return { id, topicId, type: "single", prompt, options, answerIds: [optionId(options, answer)] };
}

function multi(
  topicId: string,
  number: number,
  prompt: string,
  answers: IndexPair,
  choices: ChoiceQuad
): AssessmentQuestion {
  const id = `${topicId}-multi-${number}`;
  const options = optionQuad(id, choices);
  return {
    id, topicId, type: "multi-select", prompt, options,
    answerIds: [optionId(options, answers[0]), optionId(options, answers[1])]
  };
}

function ordered(
  topicId: string,
  prompt: string,
  choices: ChoiceQuad,
  sequence: IndexQuad
): AssessmentQuestion {
  const id = `${topicId}-ordering`;
  const items = optionQuad(id, choices);
  return {
    id, topicId, type: "ordering", prompt, items,
    correctOrder: four(
      optionId(items, sequence[0]), optionId(items, sequence[1]),
      optionId(items, sequence[2]), optionId(items, sequence[3])
    )
  };
}

function simlet(
  topicId: string,
  prompt: string,
  output: string,
  answers: IndexPair,
  choices: ChoiceQuad
): AssessmentQuestion {
  const id = `${topicId}-simlet`;
  const options = optionQuad(id, choices);
  return {
    id, topicId, type: "simlet", prompt, output, options,
    answerIds: [optionId(options, answers[0]), optionId(options, answers[1])]
  };
}

function group(
  id: string,
  singles: [AssessmentQuestion, AssessmentQuestion, AssessmentQuestion, AssessmentQuestion],
  multiQuestions: [AssessmentQuestion, AssessmentQuestion],
  ordering: AssessmentQuestion,
  sim: AssessmentQuestion
): QuestionGroup {
  return { id, singles, multi: multiQuestions, ordering, simlet: sim };
}

const groups: QuestionGroup[] = [
  group("enterprise-architecture", [
    single("enterprise-architecture", 1, "A campus is expanding to three buildings. Which design choice best limits a broadcast or spanning-tree fault to one building while preserving routed redundancy?", 1, four(
      choice("Extend every user VLAN through all buildings", "A single Layer 2 failure domain spans the campus."),
      choice("Keep access VLANs local and route redundant distribution-to-core links", "Local Layer 2 domains contain faults; multiple routed paths remain available."),
      choice("Use one core switch as every access-layer gateway", "This concentrates the gateway and creates a major failure point."),
      choice("Disable all parallel links between layers", "Removing redundancy avoids loops but also removes alternate paths.")
    )),
    single("enterprise-architecture", 2, "An application requires recovery within seconds after a distribution-switch failure. What must the design process establish first?", 2, four(
      choice("A preferred switch vendor", "Product choice does not define the required recovery behavior."),
      choice("The number of VLANs per closet", "VLAN count alone does not express service recovery."),
      choice("Availability and recovery objectives plus tested failure paths", "Requirements and failure-domain tests determine whether the design meets the target."),
      choice("That every link uses the same speed", "Uniform speed does not ensure availability or fast recovery.")
    )),
    single("enterprise-architecture", 3, "A branch block advertises many specific routes to the core. Which design improvement can reduce routing-table churn when internal subnets change?", 0, four(
      choice("Summarize a stable, allocated branch prefix at the block boundary", "A summary can hide internal subnet changes while representing the block's reachability."),
      choice("Advertise a default route from every access switch", "Uncontrolled defaults can conceal reachability problems and misdirect traffic."),
      choice("Extend the branch spanning-tree domain to the core", "Spanning tree does not aggregate Layer 3 reachability."),
      choice("Give each host a unique VLAN", "This increases segmentation overhead rather than reducing route advertisements.")
    )),
    single("enterprise-architecture", 4, "When comparing a two-tier collapsed-core campus with a three-tier campus, which factor most directly supports choosing three tiers?", 3, four(
      choice("A requirement to use only Layer 2 uplinks", "Layer 2 uplinks are not a reason to add a distinct core tier."),
      choice("A desire to eliminate redundant paths", "Resilient enterprise designs generally preserve alternate paths."),
      choice("A requirement to put all gateways on access ports", "Gateway placement is a separate design decision."),
      choice("Scale and policy/failure-boundary needs that justify a separate fast core", "A distinct core is useful when scale and transport independence warrant it.")
    ))
  ], [
    multi("enterprise-architecture", 1, "Which two inputs should be documented before selecting a campus topology?", [0, 3], four(
      choice("Application flows and latency requirements", "Traffic patterns and performance objectives shape placement and paths."),
      choice("The current console-cable color", "It has no bearing on topology requirements."),
      choice("A preferred diagramming application", "Tool preference does not establish network needs."),
      choice("Growth, availability, and recovery objectives", "Scale and failure targets constrain a viable architecture.")
    )),
    multi("enterprise-architecture", 2, "Which two practices make a redundant campus design meaningfully resilient?", [1, 2], four(
      choice("Share both uplinks through the same known single conduit", "A shared physical failure can remove both logical paths."),
      choice("Identify shared power, fiber, and control-plane failure risks", "Diverse-looking paths are not independent if they share a failure domain."),
      choice("Test behavior after a link, device, and site failure", "Observed failover validates the documented design assumptions."),
      choice("Count redundant boxes without tracing traffic", "Device count does not reveal path or service resilience.")
    ))
  ], ordered("enterprise-architecture", "Put the enterprise design work in a useful sequence, from needs to operational proof.", four(
    choice("Validate normal and failure behavior against the requirements", "This is the final verification step."),
    choice("Record users, applications, growth, and recovery needs", "Requirements establish the design criteria."),
    choice("Define layers, Layer 2 boundaries, and routing placement", "Topology decisions translate requirements into architecture."),
    choice("Map physical and logical paths and failure domains", "Path mapping exposes shared risks before validation.")
  ), [1, 2, 3, 0]), simlet("enterprise-architecture", "Which two conclusions follow from this illustrative topology summary?", "Access VLANs: building-local\nDistribution: two switches per building\nCore: two routed paths\nFailure test: one fiber conduit carries both core paths", [1, 3], four(
    choice("The two core paths are physically independent", "The output shows both paths share one conduit."),
    choice("The shared conduit is a common-mode failure to address", "One conduit cut can remove both otherwise redundant paths."),
    choice("Local VLAN scope provides some Layer 2 fault containment", "Building-local VLANs bound the broadcast domain."),
    choice("Adding a third distribution switch fixes the conduit risk by itself", "More switches do not diversify the shared physical conduit.")
  ))),

  group("campus-fabric", [
    single("campus-fabric", 1, "A fabric edge learns an endpoint but cannot resolve its fabric location. Which role normally provides endpoint-to-location mapping?", 2, four(
      choice("The border node's external routing table", "A border routes external reachability, not endpoint registration mapping."),
      choice("The routed underlay's IGP alone", "The underlay transports packets but does not replace fabric mapping."),
      choice("The fabric control-plane node", "The control plane maintains endpoint identity-to-location information."),
      choice("The endpoint's DHCP client", "DHCP addressing does not provide fabric-wide location mapping.")
    )),
    single("campus-fabric", 2, "What should be checked before troubleshooting an overlay mapping between two fabric nodes?", 0, four(
      choice("Routed underlay reachability between the nodes", "Overlay control and data exchange rely on a functioning IP underlay."),
      choice("Spanning tree through the overlay", "The overlay is not one extended physical Layer 2 spanning-tree domain."),
      choice("A public NAT rule on each fabric edge", "NAT is not a prerequisite for internal fabric underlay reachability."),
      choice("Only the endpoint DNS suffix", "DNS cannot establish node-to-node transport.")
    )),
    single("campus-fabric", 3, "A user is authenticated at an edge but cannot reach a data-center prefix. Which fabric role is the most relevant first handoff to inspect?", 1, four(
      choice("Control-plane mapping only", "Mapping does not itself provide the external route handoff."),
      choice("The border node and its external route/policy", "The border connects fabric virtual networks to external networks."),
      choice("The endpoint's access-port speed", "Link speed does not explain missing external route advertisement."),
      choice("A second DHCP scope", "An already onboarded endpoint's external reachability is not fixed by adding a scope.")
    )),
    single("campus-fabric", 4, "Which description correctly distinguishes fabric overlay and underlay?", 3, four(
      choice("The underlay carries user identity policy; overlay provides cabling", "This reverses their functions."),
      choice("Both are separate names for the same VLAN", "The fabric separates IP transport from logical endpoint services."),
      choice("The overlay must work before IP transport exists", "Overlay communication depends on underlay reachability."),
      choice("The underlay routes node-to-node IP; the overlay carries endpoint and segmentation abstractions", "This captures the distinct transport and logical service roles.")
    ))
  ], [
    multi("campus-fabric", 1, "Which two checks are appropriate when a fabric endpoint authenticates but its application path fails?", [0, 2], four(
      choice("Confirm endpoint identity, virtual network, and assigned policy", "Authentication can succeed while segmentation or policy is wrong."),
      choice("Replace the routed underlay with a campus-wide VLAN", "That discards the routed transport design and does not diagnose policy."),
      choice("Inspect the border handoff and destination/return routes", "External paths require correct forwarding in both directions."),
      choice("Treat successful authentication as proof of application reachability", "Identity validation does not prove routing or service policy.")
    )),
    multi("campus-fabric", 2, "Which two statements about fabric roles are sound?", [1, 3], four(
      choice("A fabric edge is always the external WAN router", "External connectivity is commonly handled at a border role."),
      choice("A fabric edge attaches endpoints to the fabric", "The edge provides endpoint attachment and policy enforcement."),
      choice("The control plane forwards every endpoint packet", "Control-plane mapping is distinct from data-plane forwarding."),
      choice("A border connects fabric virtual networks toward external networks", "The border provides the fabric's external handoff.")
    ))
  ], ordered("campus-fabric", "Trace endpoint onboarding and reachability through the fabric in order.", four(
    choice("Check endpoint identity, virtual network, and policy", "Validate logical assignment after the endpoint attaches."),
    choice("Establish routed underlay reachability between fabric nodes", "The transport must function before overlay exchange."),
    choice("Register the endpoint and resolve its fabric location", "Mapping makes the endpoint locatable in the fabric."),
    choice("Forward toward the border and verify the external return path", "External reachability depends on the border and both traffic directions.")
  ), [1, 2, 0, 3]), simlet("campus-fabric", "Which two faults are indicated by this illustrative fabric status?", "edge-2 -> control-plane: reachable\nendpoint 10.40.8.21: registered, VN=staff\nedge-2 -> border-1: underlay ping loss 100%\nborder-1: external prefix 198.51.100.0/24 present", [0, 3], four(
    choice("Investigate underlay reachability from edge-2 to border-1", "The output directly reports total loss on that node path."),
    choice("The endpoint lacks a virtual-network assignment", "The endpoint is registered in the staff VN."),
    choice("The border has no route for the external prefix", "The illustrative status shows the prefix present at the border."),
    choice("Registration confirms control-plane state, not end-to-end data delivery", "Endpoint registration does not prove the edge-to-border path works.")
  ))),

  group("sdwan-architecture", [
    single("sdwan-architecture", 1, "In an SD-WAN design, which component forwards packets onto the selected transport tunnel?", 2, four(
      choice("Centralized management portal", "Management configures and monitors; it is not normally the packet-forwarding node."),
      choice("Orchestration service", "Orchestration assists onboarding and coordination, not branch transit forwarding."),
      choice("SD-WAN edge data plane", "The edge encapsulates and forwards traffic over its available transports."),
      choice("DNS resolver", "DNS resolves names and does not select or forward overlay packets.")
    )),
    single("sdwan-architecture", 2, "Voice policy should prefer a path with acceptable delay and variation. Which measurements are most directly useful?", 0, four(
      choice("Latency, loss, and jitter", "These measurements characterize path quality for real-time traffic."),
      choice("VLAN count and DHCP lease length", "Neither measures transport quality."),
      choice("Controller hostname and certificate issuer only", "Identity is needed for secure control but does not measure a path's quality."),
      choice("BGP router ID and spanning-tree priority", "These do not quantify WAN delay or loss.")
    )),
    single("sdwan-architecture", 3, "A branch has internet and MPLS transports. What is the purpose of an overlay tunnel?", 1, four(
      choice("To replace all underlay IP addressing", "Overlay tunnels use underlay IP reachability rather than replace it."),
      choice("To carry segmented, policy-controlled traffic across one or more underlays", "The overlay provides logical paths and segmentation over physical transports."),
      choice("To make every application use the same circuit", "Path policy can intentionally select different transports."),
      choice("To exchange Ethernet collisions with controllers", "Collisions are unrelated to overlay routing.")
    )),
    single("sdwan-architecture", 4, "After a WAN circuit fails, a site loses a SaaS application even though its alternate circuit is up. Which design evidence is most useful?", 3, four(
      choice("The edge device's asset tag", "Inventory does not establish path selection or service recovery."),
      choice("The number of LAN switches at the site", "LAN switch count does not show whether the alternate transport is eligible."),
      choice("A screenshot of the topology without health data", "A static diagram cannot show measured path state or policy decisions."),
      choice("Underlay reachability, tunnel/control status, and application-policy fallback", "Those items reveal whether the alternate is healthy, formed, and permitted.")
    ))
  ], [
    multi("sdwan-architecture", 1, "Which two checks should precede blaming centralized path policy for a site outage?", [0, 3], four(
      choice("Verify each underlay's IP reachability and tunnel state", "Policy cannot use a transport with failed reachability or tunnel state."),
      choice("Disable segmentation for all branches", "That broad change risks isolation and does not identify the outage."),
      choice("Assume controller status guarantees edge forwarding", "Control availability does not prove each data path."),
      choice("Check route exchange and the intended application fallback", "Routes and fallback rules determine usable alternate paths.")
    )),
    multi("sdwan-architecture", 2, "Which two statements correctly describe SD-WAN planes?", [1, 2], four(
      choice("The management plane forwards user packets between branches", "User packet forwarding occurs at edge data planes."),
      choice("Controllers distribute control or policy information to edges", "Central services communicate reachability and policy, depending on design."),
      choice("The edge data plane forwards traffic over selected tunnels", "The branch edge performs packet forwarding."),
      choice("The underlay itself guarantees application-aware failover", "Application-aware selection depends on configured policy and observed health.")
    ))
  ], ordered("sdwan-architecture", "Arrange a disciplined branch path-selection rollout.", four(
    choice("Validate failover and segmentation with representative application traffic", "Final testing verifies service behavior."),
    choice("Bring up and verify each transport underlay", "The underlay is the prerequisite transport."),
    choice("Establish authenticated control and overlay reachability", "Control and overlay state follow usable transports."),
    choice("Define application classes, preferred paths, and fallback thresholds", "Policy is specified after the available paths are understood.")
  ), [1, 2, 3, 0]), simlet("sdwan-architecture", "Which two conclusions fit this illustrative path telemetry?", "branch-7\ninternet: tunnel up, loss 0.2%, latency 28 ms\nmpls: tunnel down, BFD timeout\nvoice policy: prefer MPLS; fallback internet when MPLS unavailable", [1, 3], four(
    choice("Internet transport has no overlay tunnel", "The output reports its tunnel is up."),
    choice("The measured MPLS failure makes the configured fallback relevant", "The policy explicitly permits internet when MPLS is unavailable."),
    choice("Voice must remain offline until MPLS returns", "The listed fallback contradicts that conclusion."),
    choice("Investigate MPLS reachability/BFD while confirming voice uses internet fallback", "This checks the failed path and validates the configured alternate.")
  ))),

  group("cloud-connectivity", [
    single("cloud-connectivity", 1, "A private cloud interconnect and an encrypted internet VPN are both available. What is the strongest reason to retain and test the VPN?", 2, four(
      choice("It makes cloud routing unnecessary", "Both paths still require routing and reachability design."),
      choice("It guarantees zero latency", "Encryption does not provide a latency guarantee."),
      choice("It provides a separately validated alternate when the private interconnect fails", "A tested independent path can improve recovery options."),
      choice("It automatically prevents overlapping address space", "Overlapping prefixes still require explicit routing or translation design.")
    )),
    single("cloud-connectivity", 2, "Two cloud environments use overlapping 10.20.0.0/16 ranges. What is the key routing concern?", 0, four(
      choice("Identical prefixes can be ambiguous within a shared routing context", "A routing table cannot select distinct destinations for the same prefix without separation or translation."),
      choice("BGP cannot carry private IPv4 routes", "BGP can advertise private prefixes when policy permits."),
      choice("TLS requires globally unique private addresses", "TLS does not impose that routing requirement."),
      choice("A larger MTU resolves all address overlap", "MTU changes cannot distinguish identical destination prefixes.")
    )),
    single("cloud-connectivity", 3, "Which route should normally be advertised from a cloud connection to an enterprise only when cloud-side reachability is intended?", 1, four(
      choice("A more-specific route to every public destination", "Unbounded advertisement can redirect unrelated traffic."),
      choice("Approved cloud prefixes, with explicit import/export policy", "Scoped advertisements and policy limit reachability to intended services."),
      choice("The enterprise's entire default route toward the cloud", "That can unintentionally direct all enterprise traffic into the cloud."),
      choice("Only the cloud gateway's loopback host route", "That does not provide reachability to application subnets.")
    )),
    single("cloud-connectivity", 4, "A cloud application responds on the primary circuit but not after failover. What is the most likely missing validation?", 3, four(
      choice("The cloud account display name", "Naming has no bearing on return forwarding."),
      choice("The number of virtual machines", "VM count does not confirm the alternate route."),
      choice("Whether the primary link uses fiber", "Physical medium alone does not prove failover routing."),
      choice("Cloud return routes and stateful security behavior over the backup path", "Asymmetric routing or policy can break a flow after path change.")
    ))
  ], [
    multi("cloud-connectivity", 1, "Which two safeguards are important when designing hybrid-cloud routing?", [0, 2], four(
      choice("Filter prefixes and define explicit route import/export policy", "Scoped policy prevents accidental reachability expansion."),
      choice("Advertise every learned prefix without review", "Unfiltered routes can create leaks or unexpected traffic paths."),
      choice("Plan for overlapping prefixes before route exchange", "Overlap can make destination selection ambiguous."),
      choice("Assume encryption fixes a missing return route", "Encryption protects traffic but does not create reverse reachability.")
    )),
    multi("cloud-connectivity", 2, "Which two checks validate a cloud path failover?", [1, 3], four(
      choice("Compare the cloud logo displayed by each gateway", "Appearance does not show forwarding or policy."),
      choice("Verify alternate-path route propagation and return routing", "Both directions must resolve after the primary path is withdrawn."),
      choice("Test only an ICMP probe sourced from an unrelated subnet", "An irrelevant source may not exercise application routing or policy."),
      choice("Exercise representative application flows and security state on backup", "Real flows validate path, ACL, and stateful-device behavior.")
    ))
  ], ordered("cloud-connectivity", "Put the hybrid-cloud connectivity checks in a safe sequence.", four(
    choice("Test application and return traffic on primary and backup paths", "Service testing validates both directions."),
    choice("Inventory cloud prefixes, overlap, and required services", "Prefix and service requirements define scope."),
    choice("Set route filters and primary/backup import-export policy", "Policy controls which routes are exchanged."),
    choice("Establish encrypted or private transport and verify peer reachability", "Transport and peer state must exist before routing validation.")
  ), [1, 2, 3, 0]), simlet("cloud-connectivity", "Which two findings best explain the failed backup application test?", "primary private link: up\nbackup VPN: IKE/child SA up\ncloud route table: 10.60.4.0/24 via private link only\nenterprise backup route: 10.60.4.0/24 via VPN\napp probe on backup: no response", [0, 2], four(
    choice("Cloud return routing still points only to the private link", "No cloud-side route through the VPN is shown for the application prefix."),
    choice("The VPN security association is down", "Both IKE and child SA are reported up."),
    choice("The enterprise route alone does not establish a symmetric backup path", "The enterprise has a backup route, but the cloud return route is missing."),
    choice("The application prefix is advertised through both paths already", "The cloud route table lists only the private-link next hop.")
  ))),

  group("vrf-lite", [
    single("vrf-lite", 1, "Two departments use the same private prefix but must remain isolated on one router. Which mechanism provides distinct routing tables?", 1, four(
      choice("A shared global routing table with two ACLs", "ACLs filter traffic but do not create independent route lookups."),
      choice("VRF-Lite with interfaces assigned to separate VRFs", "Each VRF maintains a separate routing context without requiring MPLS."),
      choice("A single spanning-tree instance", "Spanning tree controls Layer 2 loops, not Layer 3 route separation."),
      choice("A larger subnet mask on both departments", "Changing masks does not necessarily eliminate overlapping addresses.")
    )),
    single("vrf-lite", 2, "An interface has been assigned to a new VRF, but its former global IP route is gone. Why?", 0, four(
      choice("Its connected route now belongs to the VRF's routing table", "Interface assignment moves the connected network into that VRF context."),
      choice("VRFs disable IP routing on the entire device", "Other routing contexts can continue forwarding independently."),
      choice("The interface automatically became a trunk", "VRF assignment is a Layer 3 context change, not trunk configuration."),
      choice("The subnet was converted to IPv6", "VRF assignment does not change the address family.")
    )),
    single("vrf-lite", 3, "A host in VRF BLUE cannot reach a server in VRF RED despite both routes existing. What is the expected default behavior?", 3, four(
      choice("The router picks whichever route has the lower metric", "Route metrics are compared within a routing context, not across isolated VRFs by default."),
      choice("The host must send a spanning-tree BPDU", "BPDUs do not enable inter-VRF routing."),
      choice("The router leaks all routes between VRFs automatically", "VRFs are separated unless deliberate route leaking is configured."),
      choice("The VRFs remain isolated until an explicit inter-VRF path/policy is configured", "Separate tables do not exchange reachability by default.")
    )),
    single("vrf-lite", 4, "Which test best verifies that a management interface is using the intended VRF?", 2, four(
      choice("Ping without specifying a source or routing context", "A default-context probe may test the wrong table."),
      choice("Inspect spanning-tree root for the management VLAN", "This does not establish the Layer 3 VRF lookup."),
      choice("Check the interface VRF and issue a VRF-scoped route lookup/probe", "These checks confirm context and test forwarding in it."),
      choice("Compare the interface description with the hostname", "Descriptions do not prove route-table membership.")
    ))
  ], [
    multi("vrf-lite", 1, "Which two properties describe VRF-Lite correctly?", [0, 3], four(
      choice("Interfaces and routes are associated with a routing context", "VRF membership selects the relevant routing table."),
      choice("It requires every packet to be MPLS-encapsulated", "VRF-Lite can provide separation without MPLS."),
      choice("Identical addresses are automatically reachable across VRFs", "Overlapping addresses remain isolated and ambiguous across a shared path."),
      choice("Inter-VRF reachability requires a deliberate mechanism and policy", "Isolation is the default; leaking or another explicit path must be designed.")
    )),
    multi("vrf-lite", 2, "Which two details should be verified when diagnosing a VRF-scoped reachability issue?", [1, 2], four(
      choice("Only the global routing table's default route", "The global table may not be used by the affected interface."),
      choice("The source interface and VRF used by the test", "A probe in the wrong context can produce misleading results."),
      choice("The destination route and next-hop resolution within that VRF", "Each VRF needs its own valid route and resolved next hop."),
      choice("The device's spanning-tree priority", "It does not determine a Layer 3 VRF lookup.")
    ))
  ], ordered("vrf-lite", "Follow packet lookup and policy for a host in an isolated VRF.", four(
    choice("Check the destination and resolved next hop in that VRF", "The VRF route table decides forwarding."),
    choice("Receive the packet on an interface assigned to the source VRF", "Ingress interface context selects the route table."),
    choice("Apply any explicitly configured inter-VRF policy/path", "Cross-context forwarding requires an intentional mechanism."),
    choice("Forward through the selected egress and validate the return context", "The return packet must also have a usable route.")
  ), [1, 0, 2, 3]), simlet("vrf-lite", "Which two conclusions follow from this illustrative routing output?", "Interface Gi0/0: VRF BLUE, 10.1.0.1/24\nBLUE route: 10.2.0.0/16 via 10.1.0.2\nRED route: 10.2.0.0/16 via 192.0.2.9\nGlobal route: 10.2.0.0/16 absent", [1, 3], four(
    choice("BLUE has no route to 10.2.0.0/16", "The BLUE routing table explicitly contains the prefix."),
    choice("BLUE forwarding uses its own 10.1.0.2 next hop", "The displayed BLUE route identifies that next hop."),
    choice("The RED route is automatically selected by BLUE hosts", "Separate VRFs do not share routes automatically."),
    choice("The absence in the global table does not remove BLUE's route", "A route can exist in BLUE while absent from the global context.")
  ))),

  group("gre-tunnels", [
    single("gre-tunnels", 1, "Two routers establish a GRE tunnel, but tunnel protocol traffic fails. Which underlay requirement should be checked first?", 0, four(
      choice("IP reachability between the configured tunnel source and destination", "GRE encapsulated packets need reachable outer endpoints."),
      choice("A shared spanning-tree root across the provider", "The provider IP underlay does not require a shared customer spanning-tree domain."),
      choice("A matching DHCP scope on both tunnel endpoints", "Tunnel endpoints need routed IP reachability, not a shared DHCP scope."),
      choice("A BGP session inside the tunnel before the tunnel exists", "The tunnel's outer reachability is a prerequisite for any overlay routing.")
    )),
    single("gre-tunnels", 2, "What does GRE add to a packet?", 1, four(
      choice("Confidentiality and peer authentication by itself", "GRE does not encrypt or authenticate payloads on its own."),
      choice("A tunnel header that encapsulates a passenger protocol over IP", "GRE provides encapsulation for supported network-layer payloads."),
      choice("Automatic route filtering between sites", "Routing policy must be configured separately."),
      choice("A replacement for an IP underlay", "GRE packets still require an IP transport path.")
    )),
    single("gre-tunnels", 3, "A requirement calls for confidentiality across an untrusted provider. What should be paired with GRE?", 3, four(
      choice("Spanning-tree PortFast", "Layer 2 edge behavior provides no confidentiality."),
      choice("A larger tunnel MTU without encryption", "MTU does not protect payloads."),
      choice("A static host route only", "A route can provide reachability but not confidentiality."),
      choice("IPsec protection, with supported GRE/IPsec integration", "IPsec can protect the tunnel traffic; compatibility and overhead must be planned.")
    )),
    single("gre-tunnels", 4, "A GRE tunnel is up/up but remote subnets are unreachable. What is a productive next check?", 2, four(
      choice("Assume all routes are learned because the interface is up", "Tunnel state does not prove route exchange or forwarding."),
      choice("Change the endpoint Ethernet duplex immediately", "An up tunnel alone does not implicate endpoint duplex."),
      choice("Inspect overlay routes, next-hop resolution, and reverse reachability", "Routing and return paths determine whether payload traffic can cross."),
      choice("Disable the provider's IP routing", "The outer IP path is necessary to carry GRE.")
    ))
  ], [
    multi("gre-tunnels", 1, "Which two facts should be considered when operating GRE over a routed WAN?", [0, 3], four(
      choice("The outer source/destination must be reachable across the underlay", "GRE depends on the transport path between tunnel endpoints."),
      choice("GRE inherently encrypts every payload", "GRE is encapsulation, not confidentiality."),
      choice("The tunnel eliminates the need for route planning", "Overlay prefixes still need routes and policy."),
      choice("Encapsulation overhead can reduce effective payload MTU", "Additional headers can trigger fragmentation or PMTUD concerns.")
    )),
    multi("gre-tunnels", 2, "Which two checks help distinguish an outer-path fault from an overlay routing fault?", [1, 2], four(
      choice("Inspect only remote DNS records", "DNS does not establish outer tunnel reachability or overlay routes."),
      choice("Probe the tunnel destination using the configured outer source", "A sourced underlay test checks endpoint-to-endpoint transport."),
      choice("Check tunnel line state and routes to remote payload prefixes", "These expose tunnel and overlay forwarding state."),
      choice("Compare access-port VLAN names", "VLAN descriptions do not diagnose routed GRE reachability.")
    ))
  ], ordered("gre-tunnels", "Build a GRE overlay from transport to usable payload routing.", four(
    choice("Verify payload routes, next hops, and return reachability", "End-to-end routing completes the overlay."),
    choice("Provide an IP underlay route between tunnel endpoints", "Outer endpoint reachability is the foundation."),
    choice("Configure GRE endpoints and compatible tunnel parameters", "The tunnel is built after the underlay works."),
    choice("Add overlay routing and, if required, IPsec protection", "Routes and security are added over the established tunnel.")
  ), [1, 2, 3, 0]), simlet("gre-tunnels", "Which two conclusions are supported by this illustrative tunnel status?", "Tunnel0: up/up\nsource 192.0.2.10, destination 192.0.2.20\nsourced ping 192.0.2.20: 5/5\nroute 10.70.0.0/16: not present\nIPsec: not configured", [1, 3], four(
    choice("Outer endpoint reachability is failing", "The sourced ping succeeds and the tunnel is up."),
    choice("The remote payload prefix lacks an installed route", "The output explicitly says the route is absent."),
    choice("Payload confidentiality is provided by GRE alone", "GRE is not encryption and IPsec is absent."),
    choice("A missing overlay route can block payload traffic despite an up tunnel", "Tunnel state does not install the remote network route.")
  ))),

  group("vxlan-overlay", [
    single("vxlan-overlay", 1, "In VXLAN, which device encapsulates an endpoint's Ethernet frame into an outer IP packet?", 2, four(
      choice("An access host's default gateway in every design", "The encapsulation function belongs at a VXLAN tunnel endpoint, not necessarily the gateway."),
      choice("An OSPF area border router", "An OSPF role does not imply VXLAN encapsulation."),
      choice("A VTEP", "A VXLAN Tunnel Endpoint maps local Layer 2 traffic to the overlay and encapsulates it."),
      choice("An IGMP querier", "IGMP manages multicast membership, not VXLAN encapsulation.")
    )),
    single("vxlan-overlay", 2, "What is the purpose of a VNI?", 1, four(
      choice("Identify the outer UDP source port uniquely per host", "UDP source ports are not the VXLAN segment identifier."),
      choice("Identify a logical Layer 2 segment in the VXLAN overlay", "The VNI distinguishes overlay segments and can scale beyond VLAN numbering."),
      choice("Select an OSPF router ID", "VNI values do not select routing protocol identities."),
      choice("Encrypt the VXLAN payload", "A VNI identifies a segment; it is not encryption.")
    )),
    single("vxlan-overlay", 3, "A VTEP can ping its peer's loopback but remote MAC learning fails. Which layer is most relevant to inspect next?", 0, four(
      choice("Overlay control-plane/endpoint learning and VNI mapping", "Underlay loopback reachability works; verify how MAC/IP endpoints and segments are advertised."),
      choice("A host's DNS search suffix", "DNS naming does not explain missing overlay MAC reachability."),
      choice("The peer's console baud rate", "Console settings have no data-plane impact."),
      choice("Only the local spanning-tree root", "A local STP view alone does not verify VNI or remote endpoint learning.")
    )),
    single("vxlan-overlay", 4, "Why should a VXLAN design verify MTU across the routed underlay?", 3, four(
      choice("VXLAN removes all outer headers", "VXLAN adds encapsulation headers."),
      choice("MTU controls which VNI is assigned", "VNI mapping is independent of interface MTU."),
      choice("A lower MTU automatically changes MAC addresses", "MTU does not alter endpoint addressing."),
      choice("Outer Ethernet, IP, UDP, and VXLAN headers consume frame space", "Insufficient underlay MTU can cause fragmentation or dropped oversized packets.")
    ))
  ], [
    multi("vxlan-overlay", 1, "Which two components are needed for a VTEP to reach a remote VXLAN endpoint?", [0, 2], four(
      choice("An underlay route to the remote VTEP address", "Encapsulated packets require IP reachability between VTEPs."),
      choice("A shared spanning-tree instance across all VTEPs", "The overlay does not require one physical campus STP domain."),
      choice("Consistent VNI/segment mapping and endpoint reachability information", "The VTEPs must associate the endpoint with the same logical segment."),
      choice("A unique IPv4 subnet for every VNI in all networks", "Addressing choices depend on design; this is not a universal protocol requirement.")
    )),
    multi("vxlan-overlay", 2, "Which two checks are useful when one workload cannot reach a remote workload in the same overlay segment?", [1, 3], four(
      choice("Check only the physical switch label", "Labels do not show VTEP reachability or segment state."),
      choice("Verify both endpoint MAC/IP entries and their VTEP locations", "Remote forwarding relies on learned endpoint location."),
      choice("Disable all underlay routing", "The VTEP underlay must route encapsulated traffic."),
      choice("Confirm matching VNI and MTU/packet delivery between VTEPs", "A mapping mismatch or encapsulation-size issue can prevent delivery.")
    ))
  ], ordered("vxlan-overlay", "Trace a unicast frame from one VTEP to a remote VTEP.", four(
    choice("Decapsulate at the destination VTEP and deliver in the mapped segment", "The receiving VTEP restores the inner frame."),
    choice("Map the ingress VLAN/segment to a VNI and encapsulate", "The source VTEP adds VXLAN and outer IP/UDP headers."),
    choice("Route the outer packet through the IP underlay to the remote VTEP", "The underlay transports the encapsulated packet."),
    choice("Resolve the destination endpoint to its remote VTEP", "The source needs endpoint-location information to select the outer destination.")
  ), [1, 3, 2, 0]), simlet("vxlan-overlay", "Which two faults are indicated by this illustrative VXLAN output?", "VTEP-A loopback 192.0.2.11 -> VTEP-B 192.0.2.12: reachable\nlocal VLAN 120 -> VNI 10120\nremote MAC aa:bb:cc:00:00:20: learned at VTEP-B\nunderlay MTU 1500; encapsulated test frame 1514 bytes: dropped", [0, 2], four(
    choice("The tested encapsulated frame exceeds the reported underlay MTU", "The stated frame size is larger than the 1500-byte underlay MTU."),
      choice("No remote endpoint location is known", "The remote MAC is learned at VTEP-B."),
      choice("Small-packet VTEP reachability does not prove large encapsulated frames fit", "The successful peer reachability can coexist with an MTU issue."),
      choice("The VNI cannot exceed VLAN 4094", "VNI 10120 is valid and independent of the 12-bit VLAN range.")
  ))),

  group("hypervisor-networking", [
    single("hypervisor-networking", 1, "A VM uses VLAN 120, but the physical switch learns no VM MAC. Which path should be traced first?", 3, four(
      choice("The VM's DNS resolver and search list", "Name resolution does not explain the missing Layer 2 MAC at the switch."),
      choice("The upstream router's OSPF process", "The symptom occurs before routed forwarding."),
      choice("The physical switch's default route", "A Layer 2 MAC should be learned without a management default route."),
      choice("VM vNIC, port group/vSwitch VLAN policy, and host uplink trunk", "Each stage must carry the VM frame to the physical switch.")
    )),
    single("hypervisor-networking", 2, "A VM sends untagged traffic through a port group configured for VLAN 120. Where may VLAN tagging occur?", 0, four(
      choice("At the virtual-switch/host uplink boundary, according to the port-group model", "The hypervisor can apply the VLAN tag as frames leave the host."),
      choice("Only at the physical router's WAN interface", "Tagging at the host access path may be needed before traffic reaches the router."),
      choice("In DNS after hostname resolution", "DNS does not modify Ethernet frames."),
      choice("At every application process independently", "VLAN assignment is a networking configuration, not per-process tagging.")
    )),
    single("hypervisor-networking", 3, "A hypervisor uplink carries multiple guest networks to a physical switch. Which switch-port mode is typically needed?", 2, four(
      choice("Routed access port with no VLAN subinterfaces", "A pure routed port cannot carry the expected tagged guest VLANs."),
      choice("SPAN destination port", "A monitor destination does not provide normal guest connectivity."),
      choice("802.1Q trunk allowing the required VLANs", "The trunk transports the guest VLAN tags across the host uplink."),
      choice("Port-channel member with LACP disabled on both ends", "This does not by itself carry the guest VLANs correctly.")
    )),
    single("hypervisor-networking", 4, "A virtual machine migration succeeds, but network access fails at the destination host. Which dependency should be verified?", 1, four(
      choice("Whether both hosts have the same console font", "Console presentation does not affect guest forwarding."),
      choice("Equivalent port-group/VLAN, uplink, and security policy at the destination", "Migration preserves compute state, but the destination network attachment must be compatible."),
      choice("The VM's CPU clock speed only", "Compute speed does not prove correct network attachment."),
      choice("That the destination host has no physical uplink", "Without a usable uplink, external guest access cannot work.")
    ))
  ], [
    multi("hypervisor-networking", 1, "Which two items should match across host uplinks for a VM network to remain consistent?", [0, 3], four(
      choice("The intended VLAN is permitted end-to-end", "A VLAN omitted from the trunk or port group breaks that guest path."),
      choice("The physical switch hostname is identical", "Hostnames do not determine VLAN forwarding."),
      choice("Every VM has the same MAC address", "Duplicate MAC addresses cause conflicts rather than consistency."),
      choice("The port-group security and teaming behavior meets the design", "Security filters and uplink selection affect VM connectivity and failover.")
    )),
    multi("hypervisor-networking", 2, "A VM can reach its local gateway but not a remote subnet. Which two checks isolate the likely boundary?", [1, 2], four(
      choice("Reinstall the guest OS without collecting evidence", "This is disruptive and does not localize the forwarding fault."),
      choice("Inspect the VM IP/mask/gateway and route toward the remote subnet", "Guest addressing or routing can fail beyond the local segment."),
      choice("Check physical trunk VLAN allowance and upstream route/ACL", "The host uplink can carry local VLAN traffic while an upstream policy or route is missing."),
      choice("Change the VM display resolution", "Display settings do not affect packet forwarding.")
    ))
  ], ordered("hypervisor-networking", "Trace guest traffic out through a virtualized access path.", four(
    choice("Forward through the physical network and verify the return path", "The upstream network completes the flow."),
    choice("Attach the VM vNIC to the intended port group", "The virtual interface selects its logical network."),
    choice("Apply the port-group VLAN/security policy in the virtual switch", "Virtual switching handles policy and tagging."),
    choice("Carry the VLAN across the host uplink to the physical switch", "The uplink transports guest traffic into the physical network.")
  ), [1, 2, 3, 0]), simlet("hypervisor-networking", "Which two findings explain why this illustrative VM has no remote connectivity?", "VM vNIC: connected to PG-120\nPG-120: VLAN 120\nhost uplink Gi1/0/10: trunk, allowed VLANs 10,20,99\nphysical access switch: VLAN 120 active", [1, 3], four(
    choice("The VM vNIC is disconnected", "The virtual interface is reported connected."),
    choice("VLAN 120 is missing from the host-uplink allowed list", "Only VLANs 10, 20, and 99 are allowed on the trunk."),
    choice("VLAN 120 is inactive on the physical switch", "The physical switch reports the VLAN active."),
    choice("The port-group and physical trunk VLAN policies do not align", "The guest is assigned VLAN 120, which the uplink does not carry.")
  ))),

  group("advanced-vlan-trunking", [
    single("advanced-vlan-trunking", 1, "Two switches form a trunk, but VLAN 120 traffic is absent on the far side. Which configuration check is most direct?", 1, four(
      choice("Verify that both switches use the same hostname", "Hostname agreement is unrelated to VLAN carriage."),
      choice("Confirm VLAN 120 exists and is permitted on both trunk ends", "The VLAN must be active and allowed along the trunk."),
      choice("Increase OSPF hello timers", "OSPF timers do not determine Layer 2 trunk VLAN allowance."),
      choice("Set the access-port voice VLAN to 120", "A voice VLAN setting on an access port does not fix the inter-switch trunk.")
    )),
    single("advanced-vlan-trunking", 2, "Why should native VLAN settings match on both sides of an 802.1Q trunk?", 0, four(
      choice("Untagged frames otherwise map to different VLANs at each end", "A native VLAN mismatch can cause traffic misclassification and security issues."),
      choice("It enables BGP route reflection", "Native VLAN choice does not affect BGP."),
      choice("It is required to elect an STP root", "STP root election does not require a specific native VLAN."),
      choice("It encrypts tagged frames", "802.1Q tagging is not encryption.")
    )),
    single("advanced-vlan-trunking", 3, "A trunk should carry only VLANs 10, 20, and 99. What is the best least-privilege configuration principle?", 2, four(
      choice("Allow every VLAN and rely on host firewalls", "This unnecessarily extends Layer 2 reachability."),
      choice("Set VLAN 10 as native and assume the rest are excluded", "Native VLAN selection does not define the full allowed list."),
      choice("Explicitly restrict the allowed VLAN list to the three required VLANs", "A narrow allowed list limits unintended VLAN extension."),
      choice("Convert the trunk to an access port without checking peers", "That can interrupt every intended tagged VLAN.")
    )),
    single("advanced-vlan-trunking", 4, "A trunk shows up, but a new VLAN is missing from one side's forwarding database. What should be checked before changing spanning tree?", 3, four(
      choice("The router's NTP source", "Clock synchronization does not enable VLAN carriage."),
      choice("The endpoint's default route", "A missing Layer 2 VLAN is earlier than routed gateway forwarding."),
      choice("Whether the switch supports IPv6", "IPv6 capability is unrelated to this VLAN trunk state."),
      choice("VLAN creation, allowed-list pruning, and matching encapsulation/native settings", "These checks establish whether the VLAN can traverse the trunk.")
    ))
  ], [
    multi("advanced-vlan-trunking", 1, "Which two properties are important to verify on a trunk pair?", [0, 2], four(
      choice("Compatible 802.1Q/native VLAN behavior at both ends", "Consistent tagging rules prevent untagged traffic being assigned differently."),
      choice("Identical switch management IP addresses", "Duplicate management addresses cause a conflict."),
      choice("The required VLANs are active and allowed across the path", "A trunk cannot carry a VLAN that is missing or pruned."),
      choice("All unused VLANs are added to the allowed list", "Permitting unneeded VLANs broadens the Layer 2 domain.")
    )),
    multi("advanced-vlan-trunking", 2, "Which two controls reduce accidental Layer 2 extension?", [1, 3], four(
      choice("Use one campus-wide native VLAN for every device regardless of design", "Uniformity without a specific need does not itself constrain VLAN scope."),
      choice("Prune the trunk allowed list to required VLANs", "Explicit pruning avoids carrying unrelated broadcast domains."),
      choice("Allow dynamic trunk negotiation on every untrusted edge port", "Negotiation can form trunks where only access behavior is intended."),
      choice("Keep user VLANs local where the design permits", "Local VLAN scope contains broadcast and loop impact.")
    ))
  ], ordered("advanced-vlan-trunking", "Validate an intended VLAN across a trunk from configuration to forwarding.", four(
    choice("Verify the VLAN is active and learned/forwarding as intended", "Final state confirms actual operation."),
    choice("Create the VLAN in the relevant switching domains", "The VLAN must exist before it can be carried."),
    choice("Permit it on every required trunk and align native/tagging settings", "Every link in the path must allow consistent carriage."),
    choice("Check spanning-tree state and end-to-end frame delivery", "STP state and a data test confirm the path.")
  ), [1, 2, 3, 0]), simlet("advanced-vlan-trunking", "Which two facts best explain why VLAN 120 cannot cross the trunk?", "SW-A Gi1/0/1: trunk, native 999, allowed 10,20,120,999\nSW-B Gi1/0/1: trunk, native 1, allowed 10,20,99\nVLAN 120: active on both switches\nSTP VLAN 120: forwarding on SW-A", [1, 3], four(
    choice("VLAN 120 is missing from SW-A's allowed list", "SW-A explicitly allows VLAN 120."),
    choice("SW-B does not permit VLAN 120", "The far trunk allows only VLANs 10, 20, and 99."),
    choice("VLAN 120 is inactive on SW-B", "The output says the VLAN is active on both switches."),
    choice("The native VLAN differs across the link and should be reconciled", "SW-A uses 999 while SW-B uses 1, indicating inconsistent untagged-frame mapping.")
  ))),

  group("spanning-tree-tuning", [
    single("spanning-tree-tuning", 1, "Which switch should normally be deliberately selected as the spanning-tree root for a VLAN?", 2, four(
      choice("An arbitrary edge switch chosen by lowest MAC address", "Relying on defaults can place the root in an unintended location."),
      choice("Every access switch simultaneously", "A spanning-tree instance elects one root bridge."),
      choice("A stable distribution/core switch aligned with the Layer 2 topology", "A planned root makes path selection predictable."),
      choice("A switch with the highest bridge priority value", "Higher numerical priority is less preferred in the election.")
    )),
    single("spanning-tree-tuning", 2, "What does BPDU Guard do on an edge port configured for endpoint attachment?", 0, four(
      choice("Disables or err-disables the port if a BPDU is received", "This prevents an unexpected bridge from joining through an edge port."),
      choice("Makes the port the root port automatically", "BPDU Guard does not select root or root ports."),
      choice("Permits a second spanning-tree root", "It responds to received BPDUs by protecting the edge port."),
      choice("Encrypts spanning-tree control traffic", "BPDUs are not encrypted by BPDU Guard.")
    )),
    single("spanning-tree-tuning", 3, "A redundant uplink is blocked by spanning tree. What is the correct operational conclusion?", 3, four(
      choice("The blocked link is certainly misconfigured", "A blocked alternate can be the expected loop-prevention state."),
      choice("Remove the root bridge configuration immediately", "That can cause an unintended topology change."),
      choice("Enable PortFast on all uplinks", "Edge behavior on switch uplinks can create loops."),
      choice("The alternate path is held to prevent a Layer 2 loop and may unblock after failure", "Spanning tree preserves redundancy while preventing simultaneous forwarding loops.")
    )),
    single("spanning-tree-tuning", 4, "After an STP priority change, traffic takes an unexpected path. Which evidence best guides the next step?", 1, four(
      choice("The access switch model number alone", "Model data does not show the active topology."),
      choice("Per-VLAN root, root-port, and port-role/state information", "These outputs show the elected root and resulting forwarding paths."),
      choice("The DNS resolver's address", "DNS is unrelated to spanning-tree election."),
      choice("An unscoped ping from the switch CPU", "A ping may not reveal the Layer 2 role selection.")
    ))
  ], [
    multi("spanning-tree-tuning", 1, "Which two practices support a predictable, protected STP topology?", [0, 3], four(
      choice("Set primary and secondary root priorities deliberately", "Explicit priorities prevent unintended root election."),
      choice("Enable PortFast on every inter-switch link", "PortFast on switch links can bypass expected loop protection."),
      choice("Ignore per-VLAN root placement because all VLANs share one root", "Per-VLAN spanning-tree instances can elect different roots."),
      choice("Use edge behavior and BPDU Guard only on appropriate endpoint-facing ports", "This protects host ports without treating switch uplinks as edges.")
    )),
    multi("spanning-tree-tuning", 2, "An access switch reports intermittent topology changes. Which two checks are useful?", [1, 2], four(
      choice("Change the switch hostname to clear the counter", "A hostname change does not resolve topology events."),
      choice("Identify the port and source of received topology-change BPDUs", "The originating segment or port helps locate the changing bridge/link."),
      choice("Check for endpoint-facing ports that receive unexpected BPDUs", "An unintended bridge can repeatedly alter topology."),
      choice("Disable STP across the VLAN", "Removing loop prevention risks a broadcast storm.")
    ))
  ], ordered("spanning-tree-tuning", "Make and verify a deliberate STP root placement.", four(
    choice("Confirm root, root ports, designated ports, and expected forwarding paths", "State verification confirms election and path."),
    choice("Map VLAN scope and intended root location", "Topology intent determines root placement."),
    choice("Set primary and secondary bridge priorities on planned switches", "Priorities implement the desired election."),
    choice("Test a redundant-link failure and check reconvergence", "Failure validation checks resilience.")
  ), [1, 2, 0, 3]), simlet("spanning-tree-tuning", "Which two conclusions fit this illustrative spanning-tree status?", "VLAN 20 root: Dist-A, priority 24596\nAccess-3 Gi1/0/1: root, forwarding\nAccess-3 Gi1/0/2: alternate, discarding\nAccess-3 Gi0/10: edge; BPDU received, guard action: err-disable", [1, 3], four(
    choice("Both uplinks are forwarding and may create a loop", "The alternate port is discarding."),
    choice("Gi1/0/2 is a standby alternate path, not necessarily a fault", "An alternate/discarding role is normal loop prevention."),
    choice("Dist-A is not the elected root", "The output names Dist-A as root."),
    choice("BPDU Guard acted after an edge port received a BPDU", "The status reports an edge port BPDU and guard err-disable.")
  ))),

  group("etherchannel-lacp", [
    single("etherchannel-lacp", 1, "Two physical links are intended to form one LACP channel, but only one member bundles. What should be compared first?", 0, four(
      choice("Speed/duplex, trunk/access settings, allowed VLANs, and LACP mode", "Member links must have compatible Layer 2 and physical configuration to bundle."),
      choice("The two switch hostnames", "Hostnames do not determine LACP member compatibility."),
      choice("The OSPF process ID on both switches", "LACP operates at Layer 2 and does not require OSPF."),
      choice("The DNS records for each interface", "DNS does not affect link aggregation.")
    )),
    single("etherchannel-lacp", 2, "What is a practical benefit of LACP EtherChannel?", 2, four(
      choice("It guarantees one flow uses the sum of every member's bandwidth", "Hash-based distribution usually maps an individual flow to a member."),
      choice("It eliminates the need to configure both channel endpoints", "The two ends still need compatible channel configuration."),
      choice("It treats compatible links as one logical link and can survive a member loss", "The bundle provides one logical interface with member-level redundancy."),
      choice("It encrypts frames between switches", "LACP negotiates aggregation; it does not encrypt traffic.")
    )),
    single("etherchannel-lacp", 3, "Why can a single TCP flow fail to reach the sum of a four-link bundle's bandwidth?", 1, four(
      choice("LACP disables all but one member permanently", "Multiple links can forward traffic in the bundle."),
      choice("Hash-based flow distribution generally keeps a flow on one member", "Per-flow hashing avoids reordering but limits a single flow to one member rate."),
      choice("The port-channel has no logical interface", "A configured port-channel is the bundle's logical interface."),
      choice("EtherChannel works only for multicast", "Unicast flows can be distributed across member links.")
    )),
    single("etherchannel-lacp", 4, "An LACP bundle is down after a maintenance change. Which state should be inspected before disabling LACP?", 3, four(
      choice("The NTP stratum", "Clock source does not show member negotiation state."),
      choice("The remote endpoint's web interface", "That does not establish switch-side aggregation compatibility."),
      choice("The VLAN database revision alone", "This does not report LACP member negotiation."),
      choice("LACP neighbor/system IDs, member state, and port-channel consistency", "These distinguish negotiation from configuration mismatch.")
    ))
  ], [
    multi("etherchannel-lacp", 1, "Which two configuration mismatches can prevent links from joining the same LACP bundle?", [0, 2], four(
      choice("One member is configured as access while another is a trunk", "Inconsistent switchport mode can prevent aggregation or cause unsafe behavior."),
      choice("The interface descriptions use different wording", "Descriptions do not affect protocol compatibility."),
      choice("One side uses incompatible LACP negotiation settings or channel membership", "Negotiation and channel assignment must agree sufficiently to form the bundle."),
      choice("The interfaces have distinct physical port numbers", "Separate member ports are expected.")
    )),
    multi("etherchannel-lacp", 2, "Which two operational statements about a port-channel are accurate?", [1, 3], four(
      choice("Every packet is duplicated across all member links", "EtherChannel distributes traffic; it does not replicate each unicast packet."),
      choice("A failed member can leave the logical channel up if capacity remains", "The bundle can continue with surviving active members."),
      choice("Adding members guarantees lower latency for each single flow", "A single flow can remain assigned to one member by the hash."),
      choice("The logical interface's VLAN and Layer 3 settings should be consistent with the bundle design", "Configuration should be applied coherently to the logical channel.")
    ))
  ], ordered("etherchannel-lacp", "Build and verify an LACP bundle safely.", four(
    choice("Verify bundled members and test traffic plus member-failure behavior", "Operational testing confirms aggregation and resilience."),
    choice("Select compatible member links and intended channel parameters", "Member compatibility is established before negotiation."),
    choice("Configure both endpoints for the same logical channel and LACP", "Both sides must participate in the bundle."),
    choice("Apply consistent Layer 2/Layer 3 settings to the port-channel", "The logical interface settings define the resulting link.")
  ), [1, 2, 3, 0]), simlet("etherchannel-lacp", "Which two findings explain the unbundled member?", "Po10: down\nGi1/0/1: LACP active, bundled\nGi1/0/2: LACP active, individual\nGi1/0/2 switchport: access VLAN 30; Po10: trunk VLANs 10,30", [1, 3], four(
    choice("Both links are bundled in Po10", "Gi1/0/2 is explicitly marked individual."),
    choice("Gi1/0/2 has a Layer 2 mode mismatch with the trunk port-channel", "The member is access while the logical channel is a trunk."),
    choice("LACP is disabled on Gi1/0/2", "The status shows LACP active."),
    choice("The shown mismatch should be corrected consistently at both ends", "Members must match the channel's intended mode and peer configuration.")
  ))),

  group("ospf-design", [
    single("ospf-design", 1, "In a conventional multi-area OSPF design, which area should connect all nonbackbone areas?", 0, four(
      choice("Area 0, the backbone", "The backbone provides the central inter-area transit in standard hierarchical OSPF design."),
      choice("Any random nonbackbone area", "A nonbackbone area does not replace the backbone role."),
      choice("Area 255 only", "OSPF area IDs are identifiers; 255 has no universal backbone property."),
      choice("An external BGP autonomous system", "An AS is not an OSPF area.")
    )),
    single("ospf-design", 2, "Two OSPF routers on an Ethernet segment remain in 2-Way rather than Full. What is a common explanation?", 1, four(
      choice("The OSPF process has stopped on both routers", "A stopped process would not maintain a 2-Way neighbor state."),
      choice("They are DROther routers that need not form Full adjacency with each other", "On broadcast networks, DROther-to-DROther neighbors normally remain 2-Way."),
      choice("The routes have identical metrics", "Route metrics do not determine adjacency state."),
      choice("IPv4 multicast is never used by OSPF", "OSPF uses multicast on broadcast networks for hello discovery.")
    )),
    single("ospf-design", 3, "A new OSPF adjacency fails at ExStart/Exchange. Which mismatch is a strong candidate?", 2, four(
      choice("The routers have different interface descriptions", "Descriptions do not participate in database exchange."),
      choice("The DNS search domain differs", "DNS configuration does not define OSPF database negotiation."),
      choice("MTU or database-exchange compatibility", "An MTU mismatch can prevent successful database description exchange."),
      choice("The BGP local preference differs", "BGP attributes do not affect OSPF adjacency formation.")
    )),
    single("ospf-design", 4, "A passive OSPF interface has a connected network that must still be advertised, but must not form neighbors. What does passive mode provide?", 3, four(
      choice("It removes the connected network from all routing tables", "Passive behavior does not inherently withdraw the network advertisement."),
      choice("It converts the interface to a Layer 2 access port", "Passive OSPF is not switchport mode."),
      choice("It encrypts OSPF packets but allows adjacency", "Passive mode suppresses OSPF neighbor communication."),
      choice("It advertises the network while suppressing OSPF hellos on that interface", "This supports advertisement of host-facing networks without forming neighbors there.")
    ))
  ], [
    multi("ospf-design", 1, "Which two checks are central when OSPF neighbors fail to form?", [0, 2], four(
      choice("Area, timers, authentication, and network-type compatibility", "These parameters must be compatible for adjacency."),
      choice("Matching interface descriptions", "Descriptions are operational labels, not neighbor requirements."),
      choice("IP subnet/mask and bidirectional hello reachability", "Routers need compatible link addressing and must receive hellos."),
      choice("Identical router IDs on the two routers", "Router IDs must be unique, not identical.")
    )),
    multi("ospf-design", 2, "Which two OSPF design practices improve stability and fault containment?", [1, 3], four(
      choice("Place every interface in one enormous area regardless of scale", "A single oversized area can increase flooding and operational scope."),
      choice("Use deliberate area boundaries and summarize where appropriate", "Boundaries can reduce inter-area detail and contain topology changes."),
      choice("Form adjacencies on every host-facing interface", "Unnecessary neighbors expose more control-plane surface."),
      choice("Use passive interfaces where neighbor formation is not intended", "Passive mode can advertise a network without sending hellos there.")
    ))
  ], ordered("ospf-design", "Troubleshoot an OSPF adjacency before changing route policy.", four(
    choice("Confirm neighbor state and database synchronization", "The completed adjacency should synchronize its LSDB."),
    choice("Verify interface addressing and bidirectional IP/hello reachability", "Basic link and hello delivery are prerequisites."),
    choice("Compare area, timers, authentication, network type, and MTU", "Protocol parameters must be compatible."),
    choice("Inspect advertised networks and resulting route selection", "Route verification follows a healthy adjacency.")
  ), [1, 2, 0, 3]), simlet("ospf-design", "Which two interpretations fit this illustrative neighbor output?", "R1 Gi0/0: 10.0.12.1/30, area 0, hello 10s, dead 40s, MTU 1500\nR2 Gi0/0: 10.0.12.2/30, area 0, hello 10s, dead 40s, MTU 9000\nneighbor state: EXSTART", [0, 2], four(
    choice("The OSPF MTU mismatch is a plausible cause of the stuck exchange", "The peers report 1500 and 9000 MTU with ExStart."),
    choice("Different interface IP addresses prevent adjacency", "The peers have different addresses in the same /30, as expected."),
    choice("The hello and dead timers match", "Both sides show 10-second hello and 40-second dead timers."),
    choice("The area IDs differ", "Both interfaces are in area 0.")
  ))),

  group("fhrp-gateway-redundancy", [
    single("fhrp-gateway-redundancy", 1, "What does a first-hop redundancy protocol present to hosts?", 2, four(
      choice("A unique physical MAC address for every upstream router", "Hosts use a shared virtual gateway identity, not one unique physical gateway per router."),
      choice("A BGP route reflector", "FHRP provides default-gateway availability, not route reflection."),
      choice("A virtual default-gateway address backed by participating routers", "Hosts can retain one gateway address while router roles change."),
      choice("A DHCP server that assigns routes", "FHRP does not replace DHCP.")
    )),
    single("fhrp-gateway-redundancy", 2, "An active FHRP router loses its upstream path but its LAN interface stays up. What feature can trigger a role change?", 0, four(
      choice("Track the relevant uplink or reachability object and reduce priority on failure", "Tracking lets gateway preference reflect loss of upstream service."),
      choice("Raise the LAN interface speed", "Speed does not detect loss of the upstream path."),
      choice("Disable all standby routers", "That removes redundancy rather than selecting a healthy gateway."),
      choice("Change the virtual IP on every host", "Host reconfiguration defeats the shared-gateway model.")
    )),
    single("fhrp-gateway-redundancy", 3, "Both routers claim the active gateway role after a maintenance change. Which condition should be checked?", 1, four(
      choice("Whether both have the same console terminal width", "Terminal display settings cannot cause split gateway roles."),
      choice("FHRP hello reachability, group parameters, and Layer 2 adjacency", "A partition or mismatched group configuration can create competing active routers."),
      choice("The DHCP lease time only", "Lease duration does not establish FHRP peer communication."),
      choice("The remote server's BGP MED", "BGP path attributes are unrelated to LAN FHRP election.")
    )),
    single("fhrp-gateway-redundancy", 4, "Why should a preemption policy be chosen deliberately?", 3, four(
      choice("Preemption is needed to encrypt virtual MAC frames", "Preemption does not provide encryption."),
      choice("It controls whether an eligible higher-priority router reclaims active role", "Preemption determines whether a preferred router can take back active duty."),
      choice("It selects the OSPF area for the subnet", "FHRP election does not assign OSPF areas."),
      choice("An immediate reclaim may disrupt traffic if the preferred router is unstable", "Preemption behavior can cause repeated role changes during recovery.")
    ))
  ], [
    multi("fhrp-gateway-redundancy", 1, "Which two elements should be verified when an FHRP failover does not occur as expected?", [0, 3], four(
      choice("Group/version, virtual address, priority, and timer compatibility", "Peers need compatible group settings to coordinate."),
      choice("The switch's DNS suffix", "DNS suffix does not control gateway election."),
      choice("That both routers use the same physical interface MAC", "Routers normally have distinct physical MACs and use a virtual identity."),
      choice("Tracking state and whether priority/preemption policy is configured as intended", "Tracking influences role preference when an upstream path fails.")
    )),
    multi("fhrp-gateway-redundancy", 2, "Which two observations indicate that gateway redundancy is working as intended?", [1, 2], four(
      choice("Both routers continuously own the same virtual IP as active", "Normally one router forwards as active while another is standby/listening."),
      choice("Hosts keep the same default-gateway address through a role change", "The virtual gateway identity hides the router transition from hosts."),
      choice("The surviving router forwards after a controlled active-router failure", "A failure test validates actual availability."),
      choice("The standby router's upstream route is never tested", "Unverified standby paths may fail during real takeover.")
    ))
  ], ordered("fhrp-gateway-redundancy", "Validate a tracked first-hop gateway failover.", four(
    choice("Restore or stabilize the preferred router and verify the selected role", "Check recovery and preemption behavior."),
    choice("Check FHRP peers and baseline active/standby roles", "Establish the starting state."),
    choice("Simulate loss of the tracked upstream object", "Trigger the failure condition the policy is meant to detect."),
    choice("Confirm priority change, gateway takeover, and host traffic continuity", "Observe the role change and real forwarding.")
  ), [1, 2, 3, 0]), simlet("fhrp-gateway-redundancy", "Which two findings explain why the active gateway did not yield after its uplink failed?", "R1 group 10: active, priority 110\nR1 tracked object 5: down; decrement configured 20\nR1 effective priority: 90\nR2 group 10: standby, priority 100\npreempt: disabled on R2", [0, 2], four(
    choice("R1 tracking reduced its effective priority below R2's configured priority", "The tracked failure decremented R1 from 110 to 90, below R2's 100."),
    choice("R1 tracking object remained up", "The object is explicitly down."),
    choice("R2 has preemption disabled, so it will not reclaim active status based on its higher priority", "The output explicitly shows preemption disabled on R2."),
    choice("R2 has the higher effective priority and is already active", "R2 is reported standby with configured priority 100.")
  ))),

  group("bfd-fast-failover", [
    single("bfd-fast-failover", 1, "What is BFD primarily used to provide to a routing protocol?", 1, four(
      choice("A replacement for routing protocol policy", "BFD detects forwarding-path failure; it does not calculate routing policy."),
      choice("Rapid detection of a path failure through lightweight sessions", "BFD can notify a client protocol faster than long routing timers."),
      choice("Encryption of routing updates", "BFD is a failure-detection protocol, not encryption."),
      choice("Automatic address assignment to neighbors", "BFD does not assign addresses.")
    )),
    single("bfd-fast-failover", 2, "A BFD session fails immediately after lowering detection timers on one side. What should be considered?", 0, four(
      choice("Negotiated transmit/receive intervals and multiplier must be supportable at both ends", "Detection time depends on agreed intervals and multiplier; unsupported values may flap."),
      choice("BFD timers are ignored by all peers", "Peers negotiate and use BFD parameters when enabled."),
      choice("The BGP AS number changes the BFD packet checksum", "AS number is not the BFD timer mechanism."),
      choice("Spanning-tree root selection must match the BFD multiplier", "STP root does not determine BFD negotiation.")
    )),
    single("bfd-fast-failover", 3, "Why is BFD often integrated with OSPF or BGP rather than used alone?", 3, four(
      choice("BFD chooses the shortest route based on bandwidth", "Routing protocols select routes; BFD detects session/path failure."),
      choice("BFD advertises every connected subnet", "Route origination is not BFD's role."),
      choice("The routing protocol encrypts BFD packets automatically", "Encryption requires separate mechanisms."),
      choice("A client protocol can react to BFD detection by withdrawing or recalculating routes", "BFD signals failure so the routing protocol can converge.")
    )),
    single("bfd-fast-failover", 4, "What is a risk of configuring aggressively short BFD detection intervals without validating the path?", 2, four(
      choice("The router permanently disables all interfaces", "BFD timeout does not inherently shut all interfaces."),
      choice("BFD converts IPv4 routes to IPv6", "Address-family conversion is unrelated."),
      choice("Transient delay or control-plane load can cause false failure detection", "Timers that are too aggressive can flap under jitter or load."),
      choice("The network becomes immune to packet loss", "BFD detects failure; it does not prevent loss.")
    ))
  ], [
    multi("bfd-fast-failover", 1, "Which two factors affect whether a BFD session can be established reliably?", [0, 2], four(
      choice("Bidirectional IP reachability and compatible BFD mode/configuration", "Both endpoints must exchange BFD control packets and agree on operation."),
      choice("A shared OSPF router ID", "Router IDs should be unique and BFD can operate with other clients."),
      choice("Platform support and sustainable interval/multiplier values", "Hardware/software and load constrain usable detection timing."),
      choice("Identical interface descriptions", "Descriptions do not participate in BFD.")
    )),
    multi("bfd-fast-failover", 2, "Which two statements about BFD integration are accurate?", [1, 3], four(
      choice("BFD independently selects the best BGP path", "BGP path selection is separate from BFD failure detection."),
      choice("A routing protocol can use BFD down state to accelerate neighbor/path reaction", "BFD informs the client protocol of a detected failure."),
      choice("A BFD Up state proves application-level reachability", "BFD checks a path/session, not every application dependency."),
      choice("Timers should be tested against expected loss, jitter, and device capacity", "Operational limits matter to prevent false flaps.")
    ))
  ], ordered("bfd-fast-failover", "Bring up and validate a BFD-assisted routing adjacency.", four(
    choice("Test a controlled path failure and observe client-protocol convergence", "Failure testing validates the benefit."),
    choice("Verify interface and bidirectional IP reachability", "BFD needs transport connectivity."),
    choice("Enable compatible BFD settings on both endpoints and client protocol", "Endpoints and routing client must participate."),
    choice("Confirm negotiated intervals, multiplier, and stable BFD state", "A stable negotiated session is prerequisite to failover test.")
  ), [1, 2, 3, 0]), simlet("bfd-fast-failover", "Which two interpretations fit this illustrative adjacency status?", "neighbor 192.0.2.2: BFD Down\nlocal detect: 300 ms (100 ms x 3)\ninterface Gi0/0: up/up, no errors\nOSPF neighbor: Down; BFD client notification received", [0, 3], four(
    choice("BFD has detected loss of the neighbor session despite the local interface being up", "Interface state can remain up while end-to-end control packets fail."),
    choice("The interface is administratively down", "The output says up/up."),
    choice("OSPF ignored the BFD event", "The status says OSPF received the BFD client notification."),
    choice("Inspect the peer/path and BFD packet exchange rather than only physical carrier", "BFD down with carrier up points to a path or peer-level issue.")
  ))),

  group("eigrp-fundamentals", [
    single("eigrp-fundamentals", 1, "What does EIGRP's DUAL algorithm maintain to support loop-free route selection and fast recovery?", 2, four(
      choice("A spanning-tree topology database", "DUAL is a routing computation, not Layer 2 loop prevention."),
      choice("A list of BGP communities", "Communities are BGP attributes, not EIGRP DUAL state."),
      choice("Successor and feasible-successor information", "DUAL tracks best and eligible backup paths for loop-free recovery."),
      choice("A NAT translation table", "NAT state is unrelated to EIGRP route computation.")
    )),
    single("eigrp-fundamentals", 2, "An EIGRP route is installed through a successor. What does successor mean?", 0, four(
      choice("The current best next hop for the destination", "The successor is the selected route's next hop."),
      choice("Any neighbor advertising the same prefix", "Not every advertising neighbor is selected as successor."),
      choice("A backup that is guaranteed to meet the feasibility condition", "That describes a feasible successor, not necessarily the current successor."),
      choice("The remote endpoint's EIGRP process number", "An autonomous-system/process identifier is not a successor role.")
    )),
    single("eigrp-fundamentals", 3, "A feasible successor can provide rapid failover when the successor fails. What property makes it eligible?", 1, four(
      choice("It has the lowest router ID", "Router ID alone does not establish the EIGRP feasibility condition."),
      choice("Its reported distance is less than the current feasible distance", "The feasibility condition helps guarantee a loop-free alternate."),
      choice("It advertises a default route only", "Default-route status is unrelated to feasibility."),
      choice("It is on the same physical interface as the successor", "A separate usable path is typically needed for alternate forwarding.")
    )),
    single("eigrp-fundamentals", 4, "Two EIGRP neighbors do not become adjacent. Which parameter is a key compatibility check?", 3, four(
      choice("Matching interface descriptions", "Descriptions are not adjacency parameters."),
      choice("The same management DNS server", "DNS server configuration does not form EIGRP neighbors."),
      choice("Matching spanning-tree priority", "EIGRP is a Layer 3 routing protocol."),
      choice("AS/process relationship, K-values, addressing, and hello reachability", "EIGRP peers require compatible protocol parameters and bidirectional communication.")
    ))
  ], [
    multi("eigrp-fundamentals", 1, "Which two statements about EIGRP route metrics are accurate?", [0, 2], four(
      choice("Configured metric components and K-values determine how paths are compared", "Metric calculation depends on enabled components and compatible K-values."),
      choice("The route metric is based only on router ID", "Router ID is not the EIGRP composite metric."),
      choice("Bandwidth and delay are commonly used metric components", "These are the default influential components in classic EIGRP metric calculation."),
      choice("A lower metric always means the neighbor is loop-free", "Metric preference alone does not prove feasibility.")
    )),
    multi("eigrp-fundamentals", 2, "Which two pieces of evidence help diagnose an EIGRP route missing from the RIB?", [1, 3], four(
      choice("Only the Ethernet cable color", "Cable color is not protocol or route-selection evidence."),
      choice("Neighbor state and the topology-table entry for the prefix", "These show whether a route was learned and its successor state."),
      choice("DNS resolution of the prefix string", "A route prefix is not resolved through DNS."),
      choice("Route metric/feasibility and competing RIB route preference", "A learned route can lose selection or lack a usable successor.")
    ))
  ], ordered("eigrp-fundamentals", "Trace a learned EIGRP route through selection and installation.", four(
    choice("Install the selected successor route into the routing table", "The selected best next hop is installed if eligible."),
    choice("Form a neighbor relationship and exchange topology information", "Adjacency allows route learning."),
    choice("Use DUAL metrics and feasibility state to choose successor/alternate", "The algorithm evaluates routes."),
    choice("Verify the installed route and next-hop forwarding", "Operational verification checks RIB and forwarding.")
  ), [1, 2, 0, 3]), simlet("eigrp-fundamentals", "Which two statements are supported by this illustrative topology output?", "10.80.0.0/16: successor via 192.0.2.2, FD 30720\nvia 192.0.2.6: reported distance 28160, feasible successor\nneighbor 192.0.2.6: up", [1, 3], four(
    choice("There is no route to 10.80.0.0/16", "A successor route is shown."),
    choice("The alternate meets the feasible-distance condition shown", "Its reported distance 28160 is below the current FD 30720."),
    choice("The alternate neighbor is down", "The output reports that neighbor up."),
    choice("A feasible successor is available for faster recovery if the successor fails", "The topology reports a feasible successor.")
  ))),

  group("bgp-enterprise-edge", [
    single("bgp-enterprise-edge", 1, "An enterprise learns an internet route from two providers and prefers provider A for outbound traffic. Which BGP attribute is commonly set locally to influence that choice?", 0, four(
      choice("Local preference", "Local preference is propagated within an AS and higher values are preferred for outbound path selection."),
      choice("MED on an unrelated received route", "MED primarily provides a neighboring AS with an entry preference signal."),
      choice("Ethernet VLAN ID", "VLAN identifiers are not BGP path attributes."),
      choice("OSPF cost on the provider's router", "The enterprise cannot directly set a provider router's OSPF cost.")
    )),
    single("bgp-enterprise-edge", 2, "What is the main purpose of a BGP prefix filter at an enterprise edge?", 3, four(
      choice("To guarantee that every received route is safe", "A filter helps constrain routes but cannot guarantee all operational safety."),
      choice("To increase the MTU of a peering link", "Prefix filters do not change frame size."),
      choice("To make eBGP use UDP", "BGP uses TCP."),
      choice("To limit accepted or advertised routes to the intended address set", "Prefix filtering reduces accidental route leaks and excess routes.")
    )),
    single("bgp-enterprise-edge", 3, "An eBGP session is Idle after a peer address change. Which condition is fundamental for the session to progress?", 1, four(
      choice("Matching router hostnames", "Hostnames need not match for BGP."),
      choice("IP reachability to the peer and correct neighbor/AS configuration", "TCP session establishment and BGP peering require reachability and expected neighbor identity."),
      choice("A shared STP root", "Spanning tree does not establish a routed BGP session."),
      choice("Matching local-preference values", "Local preference is a route-selection attribute, not a session prerequisite.")
    )),
    single("bgp-enterprise-edge", 4, "A route appears in the BGP table but is absent from the forwarding table. Which explanation is plausible?", 2, four(
      choice("BGP routes are never eligible for forwarding", "Selected BGP routes can be installed and forwarded."),
      choice("A VLAN name mismatch always suppresses BGP routes", "A VLAN name alone is not the cause."),
      choice("The route lost RIB selection or has an unresolved next hop", "Protocol presence does not guarantee RIB installation or FIB programming."),
      choice("The route's DNS record is missing", "DNS records do not control route installation.")
    ))
  ], [
    multi("bgp-enterprise-edge", 1, "Which two controls are valuable on an enterprise BGP peering?", [0, 2], four(
      choice("Filter and validate accepted/advertised prefixes", "Explicit policy limits reachability and protects against leaks."),
      choice("Accept all routes because BGP validates their intent", "BGP transports reachability; it does not enforce business intent automatically."),
      choice("Use authentication and session protection where supported", "Peer protection reduces unauthorized or spoofed session risks."),
      choice("Advertise internal routes to every peer without review", "Unreviewed advertisements can expose routes or create transit.")
    )),
    multi("bgp-enterprise-edge", 2, "Which two statements distinguish common BGP policy attributes?", [1, 3], four(
      choice("MED is always propagated unchanged through every autonomous system", "MED propagation and comparison depend on BGP behavior and policy."),
      choice("Local preference influences outbound path choice within an AS", "Higher local preference is generally preferred within the AS."),
      choice("AS_PATH has no loop-prevention function", "AS_PATH is used in loop detection and policy."),
      choice("AS_PATH prepending can influence some remote inbound path choices", "A longer advertised path may be less attractive to a neighbor, subject to its policy.")
    ))
  ], ordered("bgp-enterprise-edge", "Bring up a secure, policy-controlled eBGP edge.", four(
    choice("Validate received/advertised prefixes, best path, and forwarding", "Route policy and forwarding are checked after exchange."),
    choice("Establish IP reachability and validate peer address/AS", "The TCP/BGP session depends on reachable, correctly identified peers."),
    choice("Apply authentication and inbound/outbound route policy", "Peer security and prefix controls should be in place."),
    choice("Establish the session and inspect received/accepted routes", "Verify exchange before judging selected forwarding.")
  ), [1, 2, 3, 0]), simlet("bgp-enterprise-edge", "Which two conclusions fit this illustrative BGP summary?", "neighbor 203.0.113.9, remote AS 64520: Established\nreceived prefix 0.0.0.0/0: accepted\nreceived 198.51.100.0/24: rejected by prefix policy\nRIB default: via 203.0.113.9", [1, 3], four(
    choice("The BGP neighbor is not established", "The session is reported Established."),
    choice("The specific /24 was received but rejected by policy", "The output says it was rejected by the prefix policy."),
    choice("The default route was not accepted", "It is accepted and present in the RIB."),
    choice("The installed default route points toward the shown peer", "The RIB next hop is 203.0.113.9.")
  ))),

  group("ipv6-enterprise-routing", [
    single("ipv6-enterprise-routing", 1, "Which IPv6 address scope is used for communication on a single local link and is not routed between links?", 0, four(
      choice("Link-local address (fe80::/10)", "Link-local addresses support on-link functions such as neighbor discovery and next-hop use."),
      choice("Global unicast address", "Global unicast addresses are routable beyond a link."),
      choice("Unique local address", "Unique local addresses are intended for private routed domains, not a single link only."),
      choice("IPv4-mapped address", "An IPv4-mapped format is not the IPv6 link-local scope.")
    )),
    single("ipv6-enterprise-routing", 2, "An IPv6 router has a global address but hosts do not learn it as a default router. Which mechanism should be checked?", 2, four(
      choice("DHCPv4 relay", "DHCPv4 does not provide IPv6 router discovery."),
      choice("BGP MED on an unrelated peer", "MED does not advertise host default-router information."),
      choice("Router Advertisement behavior on the LAN interface", "Hosts use IPv6 Router Advertisements to learn default routers and prefixes."),
      choice("EtherChannel LACP key", "LACP does not provide IPv6 host configuration.")
    )),
    single("ipv6-enterprise-routing", 3, "Why should an IPv6 ACL design account for ICMPv6 rather than block it wholesale?", 1, four(
      choice("ICMPv6 is used only for traceroute", "It supports critical network functions beyond diagnostics."),
      choice("Neighbor Discovery and Path MTU Discovery rely on ICMPv6 messages", "Broad blocking can break address resolution and packet-size discovery."),
      choice("ICMPv6 carries all BGP updates", "BGP uses TCP, not ICMPv6."),
      choice("IPv6 has no transport protocols", "IPv6 supports TCP, UDP, and other upper-layer protocols.")
    )),
    single("ipv6-enterprise-routing", 4, "Which practice supports a reliable enterprise dual-stack rollout?", 3, four(
      choice("Assume IPv4 policy automatically filters IPv6", "IPv4 and IPv6 policies are separate and both need review."),
      choice("Disable IPv6 neighbor discovery on all interfaces", "Neighbor discovery is essential to normal IPv6 operation."),
      choice("Use one IPv4 default route as proof of IPv6 connectivity", "IPv4 reachability says nothing about IPv6 routes."),
      choice("Validate IPv6 addressing, routing, ACLs, DNS, and return paths independently", "Dual stack requires explicit checks of both address families.")
    ))
  ], [
    multi("ipv6-enterprise-routing", 1, "Which two statements about IPv6 addressing and routing are correct?", [0, 3], four(
      choice("A link-local address is required for many on-link IPv6 control functions", "Neighbor discovery and router next-hop operation commonly use link-local addresses."),
      choice("A global unicast prefix is never routable", "Global unicast is designed for routed use."),
      choice("SLAAC requires every host to use DHCPv4", "SLAAC is IPv6 address autoconfiguration."),
      choice("A route can use a link-local next hop when scoped to the correct interface", "Link-local next hops require interface context because they are not globally unique.")
    )),
    multi("ipv6-enterprise-routing", 2, "Which two checks are useful when IPv6 traffic fails while IPv4 works?", [1, 2], four(
      choice("Check only the IPv4 routing table", "That cannot show IPv6 route selection."),
      choice("Inspect IPv6 interface state, neighbor cache, and IPv6 routes", "These reveal local adjacency and route availability."),
      choice("Review IPv6 ACLs and ICMPv6 handling", "Filtering can block forwarding, neighbor discovery, or PMTUD."),
      choice("Change the IPv4 subnet mask until IPv6 recovers", "Address families are independent.")
    ))
  ], ordered("ipv6-enterprise-routing", "Trace IPv6 first-hop and routed delivery for a dual-stack client.", four(
    choice("Verify remote IPv6 route, policy, and return path", "End-to-end IPv6 forwarding requires reachability in both directions."),
    choice("Assign valid IPv6 prefix and link-local interface state", "The client and router need functioning link-local operation."),
    choice("Receive valid Router Advertisement/default-router information", "RA provides host prefix and default-router discovery."),
    choice("Resolve the on-link next hop using Neighbor Discovery", "ND resolves the Layer 2 destination for local forwarding.")
  ), [1, 2, 3, 0]), simlet("ipv6-enterprise-routing", "Which two findings explain why this host has no usable IPv6 default route?", "host address: 2001:db8:40::25/64\nneighbor cache: fe80::1 reachable\nreceived RA: router lifetime 0\nIPv4 default gateway: 192.0.2.1", [1, 3], four(
    choice("The host has no IPv6 global address", "A global IPv6 address is listed."),
    choice("The received RA advertises no default-router lifetime", "A router lifetime of zero does not establish a default router."),
    choice("Neighbor Discovery cannot resolve the link-local gateway", "The neighbor cache shows fe80::1 reachable."),
    choice("The working IPv4 gateway does not supply an IPv6 default route", "IPv4 and IPv6 default routes are independent.")
  ))),

  group("multicast-fundamentals", [
    single("multicast-fundamentals", 1, "What does IGMP provide in an IPv4 multicast network?", 1, four(
      choice("A unicast routing adjacency between every receiver and source", "IGMP manages local receiver membership, not unicast routing adjacencies."),
      choice("A way for IPv4 hosts to signal multicast group membership to a local router", "IGMP reports let the router learn which groups have listeners on a subnet."),
      choice("Encryption for multicast payloads", "IGMP does not encrypt application traffic."),
      choice("A replacement for PIM across routed links", "PIM handles multicast routing between routers; IGMP is host membership signaling.")
    )),
    single("multicast-fundamentals", 2, "A multicast stream reaches one subnet but not another. Which routing check is most relevant on an intermediate router?", 0, four(
      choice("PIM neighbor state and the multicast route/RPF interface", "PIM builds routed distribution state, and RPF validates the upstream source path."),
      choice("The OSPF passive-interface command on the receiver host", "Hosts do not run router OSPF passive-interface settings."),
      choice("The DNS MX record", "Mail exchanger records do not control multicast forwarding."),
      choice("The spanning-tree root port on the WAN", "STP is not the routed multicast forwarding mechanism.")
    )),
    single("multicast-fundamentals", 3, "What is the purpose of the Reverse Path Forwarding check for a multicast packet?", 2, four(
      choice("To verify the receiver's DNS name", "RPF does not perform name resolution."),
      choice("To choose the highest-bandwidth output link", "RPF validates the expected incoming direction, not output capacity."),
      choice("To accept traffic only when it arrives on the interface the unicast route uses toward the source", "RPF uses the unicast route toward the source as a loop-prevention check."),
      choice("To elect the IGMP querier using router ID", "Querier election is separate from RPF forwarding validation.")
    )),
    single("multicast-fundamentals", 4, "A host joins a group, but no multicast forwarding state appears on its LAN router. Which local evidence should be checked?", 3, four(
      choice("The BGP community on an unrelated unicast prefix", "Unrelated BGP attributes do not show group membership."),
      choice("The receiver's spanning-tree priority", "STP priority does not report IGMP joins."),
      choice("The sender's TCP retransmission timer", "The symptom occurs before delivery path analysis."),
      choice("IGMP reports, querier behavior, and group membership on the interface", "These confirm that the router learned a listener on the subnet.")
    ))
  ], [
    multi("multicast-fundamentals", 1, "Which two roles are correctly associated with IPv4 multicast?", [0, 3], four(
      choice("IGMP reports receiver membership on a local subnet", "Hosts use IGMP to express interest in groups to the local router."),
      choice("PIM encrypts each group packet", "PIM establishes multicast routing state; it is not payload encryption."),
      choice("RPF selects a receiver's DNS resolver", "RPF checks the incoming interface relative to the source route."),
      choice("PIM participates in building multicast distribution across routers", "PIM communicates multicast routing information between routers.")
    )),
    multi("multicast-fundamentals", 2, "A source's multicast packets fail an RPF check. Which two investigations are appropriate?", [1, 2], four(
      choice("Disable all multicast forwarding permanently", "That removes service instead of identifying the mismatch."),
      choice("Inspect the unicast route to the source and the expected RPF interface", "RPF depends on the route toward the source."),
      choice("Check multicast routing state and reverse-path topology changes", "Multicast state or asymmetric routing may select an unexpected incoming interface."),
      choice("Change the receiving host's DNS suffix", "DNS does not alter RPF selection.")
    ))
  ], ordered("multicast-fundamentals", "Trace listener-driven multicast delivery across routed links.", four(
    choice("Forward multicast along the installed distribution state toward receivers", "Routers replicate only on appropriate outgoing interfaces."),
    choice("Host signals interest in the group with IGMP", "Membership starts at the receiving host."),
    choice("Local router learns membership and participates in PIM routing", "Membership and inter-router protocol state establish the tree."),
    choice("Validate RPF toward the source on each routed hop", "RPF checks prevent incorrect forwarding loops.")
  ), [1, 2, 3, 0]), simlet("multicast-fundamentals", "Which two findings best explain why multicast from 198.51.100.8 is dropped at R3?", "R3 PIM neighbor R2: up\nR3 unicast route to 198.51.100.8: via Gi0/0\npacket from 198.51.100.8 arrived on Gi0/1\nR3 RPF check: failed", [0, 2], four(
    choice("The multicast packet arrived on an interface different from the unicast RPF interface", "RPF expects Gi0/0 but traffic arrived on Gi0/1."),
    choice("R3 has no PIM neighbor", "R2 is shown as an up PIM neighbor."),
    choice("The unicast route points to Gi0/0 as the expected source-facing interface", "That route determines the expected RPF interface."),
    choice("IGMP snooping is proven to be blocking the routed packet", "The output does not show an access-switch snooping issue.")
  ))),

  group("qos-architecture", [
    single("qos-architecture", 1, "At a congested egress interface, which QoS mechanism determines how packets receive differentiated service?", 3, four(
      choice("DNS caching", "Name caching does not schedule packets."),
      choice("VLAN pruning", "Pruning limits Layer 2 carriage, not congestion scheduling."),
      choice("BGP route reflection", "Route reflection does not manage egress queues."),
      choice("Classification/marking followed by policy and queuing", "QoS identifies traffic, applies treatment, then schedules it during congestion.")
    )),
    single("qos-architecture", 2, "Why is trusting DSCP from every access port unsafe?", 0, four(
      choice("An endpoint could mark bulk or untrusted traffic for privileged treatment", "Trust boundaries prevent clients from assigning themselves priority."),
      choice("DSCP values are used only for IPv6", "DSCP can be carried in IPv4 and IPv6 headers."),
      choice("DSCP encrypts voice packets", "DSCP is a marking, not encryption."),
      choice("Marking prevents congestion from occurring", "QoS manages congestion; it does not eliminate it.")
    )),
    single("qos-architecture", 3, "What does a policer commonly do when traffic exceeds a configured rate?", 1, four(
      choice("Always stores excess traffic in an unbounded buffer", "Policers generally do not buffer as a shaper does."),
      choice("Drop or remark excess traffic according to policy", "Policing enforces a rate by taking a configured action on excess."),
      choice("Increase the physical interface bandwidth", "A policer does not change link capacity."),
      choice("Move packets to a different VRF", "VRF assignment is separate from rate enforcement.")
    )),
    single("qos-architecture", 4, "When does egress queuing have the most direct effect?", 2, four(
      choice("When the interface has no traffic", "No contention means queue scheduling has little immediate effect."),
      choice("During DNS record updates", "DNS updates do not directly invoke packet queue scheduling."),
      choice("When offered traffic contends for limited egress bandwidth", "Queues schedule competing packets during congestion."),
      choice("When an endpoint negotiates an IP address", "DHCP negotiation is unrelated to egress congestion management.")
    ))
  ], [
    multi("qos-architecture", 1, "Which two practices produce a coherent QoS trust boundary?", [0, 2], four(
      choice("Classify/remark traffic at a controlled edge using documented policy", "A defined edge policy establishes trustworthy markings."),
      choice("Trust arbitrary endpoint markings on all access ports", "Untrusted hosts could self-promote traffic."),
      choice("Preserve or map markings consistently across each domain boundary", "Consistent mapping retains intended class meaning end-to-end."),
      choice("Assume every DSCP value means the same thing in every organization", "Administrative domains can define different marking policy.")
    )),
    multi("qos-architecture", 2, "Which two statements distinguish shaping and policing?", [1, 3], four(
      choice("Both can increase physical link capacity", "Neither creates additional capacity."),
      choice("Shaping can buffer and delay traffic to conform to a rate", "A shaper smooths bursts by queuing excess traffic."),
      choice("Policing always queues packets until capacity returns", "Policers typically drop or remark excess rather than queue it."),
      choice("Policing enforces a rate by dropping or remarking traffic that exceeds policy", "This is a common policer behavior.")
    ))
  ], ordered("qos-architecture", "Apply a packet's QoS treatment from ingress to congested egress.", four(
    choice("Schedule the classified packet in the egress queue during contention", "Queuing affects transmission order when the link is congested."),
    choice("Classify traffic and validate or set its marking at the trust boundary", "Ingress classification establishes the class."),
    choice("Apply the class policy, such as policing, shaping, or resource allocation", "Policy determines the treatment."),
    choice("Carry the class/mark through the network and map it at egress", "Consistent marking lets downstream devices preserve intended treatment.")
  ), [1, 2, 3, 0]), simlet("qos-architecture", "Which two conclusions are supported by this illustrative QoS counter sample?", "Gi0/1 egress: 100 Mb/s\nvoice queue: 8% utilization, 0 drops\nbulk queue: 92% utilization, 4,200 drops\naccess trust: DSCP trusted from all attached endpoints", [1, 3], four(
    choice("The voice queue is the one reporting the drops", "The voice queue reports zero drops."),
    choice("The bulk queue is congested or oversubscribed at this egress", "High utilization and drops indicate contention."),
    choice("The link has no egress congestion", "The bulk queue reports thousands of drops."),
    choice("Trusting every endpoint marking deserves review at the access boundary", "Untrusted endpoints may mark bulk traffic for privileged treatment.")
  ))),

  group("wireless-enterprise-design", [
    single("wireless-enterprise-design", 1, "A high-density meeting room has weak performance despite strong RSSI. Which metric should be investigated next?", 2, four(
      choice("The wired core's spanning-tree root MAC only", "A root MAC does not reveal airtime contention in the room."),
      choice("DHCP lease duration alone", "Lease time does not measure radio contention."),
      choice("Channel utilization and co-channel interference", "High airtime use or interference can reduce throughput despite strong signal."),
      choice("The access point's console baud rate", "Console settings do not affect RF performance.")
    )),
    single("wireless-enterprise-design", 2, "A client roams between APs but must reauthenticate slowly. Which design/operation area is most relevant?", 0, four(
      choice("WLAN security and roaming authentication behavior", "Roaming latency can depend on authentication method and supported fast-transition behavior."),
      choice("The DHCP server hostname capitalization", "Hostname case does not normally explain roaming authentication delay."),
      choice("The wired trunk native VLAN on an unrelated building", "An unrelated trunk does not explain a local roaming exchange."),
      choice("The SSID's display icon", "Presentation does not affect client authentication.")
    )),
    single("wireless-enterprise-design", 3, "Several APs use the same channel in a dense area. What is a likely effect?", 3, four(
      choice("Every client receives a dedicated collision-free channel", "Shared channels require airtime coordination and can contend."),
      choice("The wired VLANs automatically merge", "RF channel selection does not merge VLANs."),
      choice("RADIUS authentication becomes optional", "Channel reuse does not change WLAN authentication policy."),
      choice("Co-channel contention can consume airtime and lower effective capacity", "Devices sharing a channel compete for airtime.")
    )),
    single("wireless-enterprise-design", 4, "A WLAN client associates and authenticates but cannot reach an internal application. Which end-to-end mapping should be verified?", 1, four(
      choice("Only the client's RSSI", "Good radio association does not prove VLAN, addressing, or route access."),
      choice("SSID policy to client role/VLAN, DHCP, and routed application path", "Successful association must be followed by correct segmentation and forwarding."),
      choice("The AP's asset inventory tag", "Inventory does not show the client data path."),
      choice("The neighbor's Wi-Fi channel", "A nearby channel alone cannot explain application routing.")
    ))
  ], [
    multi("wireless-enterprise-design", 1, "Which two observations are useful when diagnosing a slow WLAN client?", [0, 3], four(
      choice("Client RSSI/SNR and retry/error rates", "Signal quality and retries indicate radio-link conditions."),
      choice("Only the SSID text shown on the screen", "SSID visibility does not measure service quality."),
      choice("The unrelated WAN router's NTP offset", "Time offset does not assess the client's RF path."),
      choice("Channel utilization/interference and client data-path policy", "Airtime contention and post-association policy both affect performance.")
    )),
    multi("wireless-enterprise-design", 2, "Which two design considerations support reliable enterprise WLAN service?", [1, 2], four(
      choice("Maximize AP transmit power without surveying", "Excess power can increase interference and impair roaming."),
      choice("Plan coverage and capacity using client density and application needs", "Capacity and coverage requirements guide AP placement and radio design."),
      choice("Align authentication, segmentation, and roaming policy with user roles", "Consistent identity and access policy preserves service while clients roam."),
      choice("Use one channel for every AP to eliminate contention", "A single channel can intensify co-channel contention.")
    ))
  ], ordered("wireless-enterprise-design", "Trace a wireless client from association to application access.", four(
    choice("Verify routed policy and the application return path", "Application access depends on downstream and return reachability."),
    choice("Associate to the intended SSID and radio", "The client first joins the WLAN."),
    choice("Authenticate and assign the intended role/segment", "Identity policy determines authorization and segmentation."),
    choice("Obtain address/configuration and validate gateway reachability", "Successful addressing and first-hop access precede remote services.")
  ), [1, 2, 3, 0]), simlet("wireless-enterprise-design", "Which two findings best explain the low throughput in this illustrative WLAN survey?", "client RSSI: -54 dBm\nSNR: 31 dB\nchannel utilization: 91%\nretry rate: 27%; two nearby APs on same channel", [1, 3], four(
    choice("The client has very weak received signal", "An RSSI of -54 dBm and SNR 31 dB indicate a comparatively strong signal."),
    choice("The channel is heavily occupied", "Utilization is reported at 91%."),
    choice("The client has no WLAN association", "The telemetry includes client radio measurements."),
    choice("High retries and nearby same-channel APs suggest contention/interference", "Retries and channel reuse can consume airtime.")
  ))),

  group("telemetry-netflow", [
    single("telemetry-netflow", 1, "What does flow telemetry such as NetFlow/IPFIX primarily summarize?", 0, four(
      choice("Observed traffic records with attributes such as addresses, ports, and counters", "Flow records describe traffic conversations rather than storing every packet payload."),
      choice("Every packet's complete application payload", "Flow telemetry is generally metadata/counters, not a full packet capture."),
      choice("The full spanning-tree topology database", "Flow records do not represent STP state."),
      choice("A replacement for route tables", "Flow analysis complements but does not replace routing state.")
    )),
    single("telemetry-netflow", 2, "A collector reports a sudden drop in flows from one router. What should be checked before concluding traffic stopped?", 3, four(
      choice("The router's hostname color in the dashboard", "Presentation does not confirm export."),
      choice("Only the collector disk size", "Storage capacity alone does not show exporter health or template decoding."),
      choice("The end-user's keyboard connection", "Input hardware does not explain flow export."),
      choice("Exporter counters, export reachability, sampling, and collector/template state", "A telemetry pipeline fault can mimic a traffic decline.")
    )),
    single("telemetry-netflow", 3, "How does packet sampling affect interpretation of a flow report?", 1, four(
      choice("It makes every record an exact packet count without scaling", "Sampled measurements are estimates and need the sampling factor."),
      choice("It trades measurement detail for reduced export/processing load", "Sampling reduces telemetry volume but affects precision."),
      choice("It encrypts all records by default", "Sampling does not provide transport security."),
      choice("It guarantees that brief flows are always captured", "Sampling can miss short or low-volume flows.")
    )),
    single("telemetry-netflow", 4, "A flow chart shows traffic from a source address, but not application intent. Which additional context is useful?", 2, four(
      choice("A switch's interface description alone", "Descriptions do not establish application identity."),
      choice("The device's serial number", "Serial numbers do not identify traffic intent."),
      choice("Address/port mapping, DNS/application inventory, and time-aligned change context", "Multiple sources can help infer the service without treating a flow as payload inspection."),
      choice("The default spanning-tree priority", "STP priority provides no application context.")
    ))
  ], [
    multi("telemetry-netflow", 1, "Which two checks help explain missing flow records at a collector?", [0, 2], four(
      choice("Confirm exporter destination/transport reachability and export counters", "The router must send records successfully to the collector."),
      choice("Disable the collector's clock synchronization", "Time skew worsens correlation and does not restore export."),
      choice("Check template/session state and collector parsing", "Without a valid template, records may be unusable or discarded."),
      choice("Assume a quiet chart proves no packets crossed the interface", "Export or ingest failure can make telemetry incomplete.")
    )),
    multi("telemetry-netflow", 2, "Which two limitations should be kept in mind when using flow analytics?", [1, 3], four(
      choice("A flow record always includes packet payload content", "Flow summaries typically do not contain full payloads."),
      choice("Sampling and exporter configuration affect completeness", "Sampling rate and record fields shape what is observed."),
      choice("Flow telemetry directly proves application health", "Traffic metadata alone does not prove transaction success."),
      choice("Timestamps and source-interface context are needed for meaningful correlation", "Time and observation point help interpret records.")
    ))
  ], ordered("telemetry-netflow", "Follow traffic telemetry from observation point to usable analysis.", four(
    choice("Correlate parsed records with time, topology, and application context", "Analysis requires context."),
    choice("Configure observation/export fields and any sampling policy", "The exporter defines data collection."),
    choice("Send records and templates to a reachable collector", "Transport delivers records and decoding metadata."),
    choice("Validate collector ingestion and record completeness", "Ingest state must be checked before analysis.")
  ), [1, 2, 3, 0]), simlet("telemetry-netflow", "Which two interpretations are supported by this illustrative telemetry status?", "exporter R5: destination 192.0.2.90:2055\nexport packets: 18,420; export failures: 0\ncollector last template: 46 minutes ago\ncollector flow count: zero for 45 minutes", [1, 2], four(
    choice("The router reports that its export destination is unreachable", "The output reports zero export failures."),
    choice("Collector template freshness is a plausible ingestion issue", "The last template is substantially older than the current zero-flow interval."),
    choice("Zero collector records alone proves there was no interface traffic", "It does not distinguish low traffic from collector/template loss."),
    choice("The router has exported records without local export failures", "The exporter counter reports packets and zero failures.")
  ))),

  group("snmpv3-syslog", [
    single("snmpv3-syslog", 1, "Why is SNMPv3 preferred over SNMPv1/v2c for protected management?", 2, four(
      choice("It automatically encrypts all syslog messages", "SNMPv3 security does not encrypt separate syslog transport."),
      choice("It removes the need for device authentication", "SNMPv3 can authenticate managers and users."),
      choice("It supports authentication and privacy protections when configured", "SNMPv3 security levels can provide message authentication and encryption."),
      choice("It prevents all management-plane denial of service", "SNMPv3 does not eliminate every attack or resource risk.")
    )),
    single("snmpv3-syslog", 2, "A monitoring system polls a device but receives no SNMP response. What should be checked first?", 0, four(
      choice("SNMP user/security level, ACL/management reachability, and engine/time synchronization", "Authentication, allowed manager access, and SNMPv3 engine state can prevent successful polling."),
      choice("The access VLAN's STP root only", "STP root state does not prove SNMP manager access."),
      choice("The device's OSPF cost to an unrelated prefix", "An unrelated metric does not diagnose management reachability."),
      choice("Whether the syslog message contains a hostname", "Syslog formatting does not govern SNMP polling.")
    )),
    single("snmpv3-syslog", 3, "What is the main operational benefit of sending syslog to a centralized collector?", 1, four(
      choice("It makes device events impossible to lose", "Network or collector failure can still lose messages unless designed otherwise."),
      choice("It provides a searchable, time-correlated event record outside the device", "Central storage supports incident correlation and retention."),
      choice("It changes the device's routing protocol", "Syslog is an event-reporting mechanism."),
      choice("It guarantees NTP synchronization", "Clock synchronization is configured separately.")
    )),
    single("snmpv3-syslog", 4, "Why are synchronized clocks important for syslog and SNMP-based incident analysis?", 3, four(
      choice("NTP increases SNMP polling frequency automatically", "Polling interval is configured separately."),
      choice("Clock synchronization encrypts syslog", "NTP does not encrypt messages."),
      choice("Timestamp alignment changes interface counters", "NTP does not alter counters."),
      choice("Events and measurements from different devices can be ordered and correlated", "Comparable time makes a cross-device timeline meaningful.")
    ))
  ], [
    multi("snmpv3-syslog", 1, "Which two measures strengthen SNMP-based management?", [0, 3], four(
      choice("Use SNMPv3 authentication/privacy and unique least-privilege users", "Protected credentials and restricted access reduce exposure."),
      choice("Expose read-write community strings to every subnet", "Broad cleartext access is unsafe and grants excessive control."),
      choice("Poll devices without documenting the collector identity", "Unknown managers complicate access control and auditing."),
      choice("Restrict management access to authorized collectors and monitor failures", "Source restrictions and telemetry help protect and audit the service.")
    )),
    multi("snmpv3-syslog", 2, "Which two checks improve the usefulness of centralized syslog?", [1, 2], four(
      choice("Disable timestamps on all devices", "Removing time makes cross-device correlation harder."),
      choice("Configure consistent time and an appropriate severity/facility policy", "Time and event selection support useful, interpretable logs."),
      choice("Verify collector reachability, storage, and ingestion", "A configured destination is not useful unless it receives and retains events."),
      choice("Send every debug event indefinitely without capacity planning", "Unbounded verbosity can overwhelm links and storage.")
    ))
  ], ordered("snmpv3-syslog", "Establish a trustworthy monitoring and event-collection path.", four(
    choice("Correlate collected events and measurements during an incident", "Analysis follows successful collection."),
    choice("Synchronize device clocks and define authorized manager/collector endpoints", "Time and endpoints establish trustworthy context."),
    choice("Configure SNMPv3 users/views and syslog severity/transport", "Management credentials and event policy are configured."),
    choice("Test polling, traps/log delivery, and collector ingestion", "A functional test confirms the pipeline.")
  ), [1, 2, 3, 0]), simlet("snmpv3-syslog", "Which two interpretations fit this illustrative management status?", "SNMPv3 poll from 192.0.2.70: authPriv, timeout\nACL management: permits 192.0.2.60 only\nsyslog destination 192.0.2.80: reachable\nNTP offset: device +4m 12s", [0, 3], four(
    choice("The SNMP manager source is not permitted by the shown management ACL", "192.0.2.70 is not the permitted 192.0.2.60 source."),
    choice("Syslog destination reachability is failing", "The destination is reported reachable."),
    choice("The SNMPv3 poll succeeds because authPriv is configured", "The poll is reported timeout."),
    choice("The device clock offset can make its event timestamps hard to correlate", "A four-minute offset undermines cross-device timelines.")
  ))),

  group("span-erspan", [
    single("span-erspan", 1, "What does a SPAN session do on a switch?", 0, four(
      choice("Copies selected traffic from source ports/VLANs to a monitor destination", "SPAN provides a local packet-monitoring copy."),
      choice("Forwards all packets through a firewall inspection path", "SPAN is a copy mechanism, not inline enforcement."),
      choice("Encrypts packets before sending them to endpoints", "SPAN does not provide packet encryption."),
      choice("Replaces the switch's forwarding table", "Monitoring does not replace forwarding state.")
    )),
    single("span-erspan", 2, "When is ERSPAN useful compared with local SPAN?", 2, four(
      choice("When a packet must be blocked inline", "ERSPAN sends copies for observation; it does not block traffic inline."),
      choice("When the observer is on the same physical port as the source only", "That is not a specific ERSPAN use case."),
      choice("When mirrored traffic needs to be transported over an IP network to a remote analyzer", "ERSPAN encapsulates mirrored packets for remote delivery."),
      choice("When a switch must negotiate LACP", "ERSPAN does not form link aggregation.")
    )),
    single("span-erspan", 3, "A packet capture misses traffic even though the source interface is busy. Which SPAN configuration issue is plausible?", 1, four(
      choice("A mismatched SNMPv3 username", "SNMP credentials do not select copied packets."),
      choice("The source direction/VLAN selection or monitor-destination capacity", "Incorrect source direction or oversubscribed destination can omit observed traffic."),
      choice("The BGP AS number on the analyzer", "The analyzer's BGP AS does not control SPAN copying."),
      choice("A host's IPv6 prefix length", "Endpoint prefix length does not configure the monitor session.")
    )),
    single("span-erspan", 4, "Why should a SPAN destination port generally not be used as an ordinary endpoint port simultaneously?", 3, four(
      choice("It cannot transmit any Ethernet frames", "Monitor destination behavior varies and is not simply a normal endpoint port."),
      choice("SPAN automatically changes its MAC address to the source's", "SPAN does not clone endpoint MAC identity."),
      choice("It becomes the spanning-tree root", "Monitor destination status does not elect an STP root."),
      choice("Monitoring configuration may alter normal forwarding behavior and consume destination capacity", "A dedicated monitor destination avoids interfering with endpoint forwarding and capture fidelity.")
    ))
  ], [
    multi("span-erspan", 1, "Which two limitations should be considered when using SPAN for packet evidence?", [0, 2], four(
      choice("Mirrored traffic can be dropped if the destination cannot keep up", "Oversubscription can make a capture incomplete."),
      choice("SPAN guarantees an exact copy of all packets under any load", "The monitor path can drop copies."),
      choice("Direction and source selection determine which frames are observed", "An incorrect source/direction omits relevant traffic."),
      choice("A SPAN capture automatically records packets from every VLAN", "Only configured sources are mirrored.")
    )),
    multi("span-erspan", 2, "Which two statements distinguish local SPAN and ERSPAN?", [1, 3], four(
      choice("Both are inline packet filtering technologies", "They copy for observation rather than enforce policy inline."),
      choice("Local SPAN sends copies to a monitor destination on the switch", "Local SPAN is switch-local monitoring."),
      choice("ERSPAN eliminates the need for a routed path to the analyzer", "Remote encapsulated copies still need IP reachability."),
      choice("ERSPAN transports mirrored packets to a remote analyzer using encapsulation", "ERSPAN enables remote packet visibility across an IP network.")
    ))
  ], ordered("span-erspan", "Configure a packet observation path and validate the capture.", four(
    choice("Confirm the analyzer receives the intended packets and note capture limits", "Verify the evidence and its completeness."),
    choice("Choose the source interface/VLAN and direction for the question", "Source selection defines the desired evidence."),
    choice("Configure local monitor destination or ERSPAN remote transport", "The chosen monitor path carries copies."),
    choice("Check destination capacity and IP reachability if remote", "Capacity and transport are prerequisites to reliable capture.")
  ), [1, 2, 3, 0]), simlet("span-erspan", "Which two interpretations are supported by this illustrative monitor status?", "source Gi1/0/5: ingress + egress\nmonitor destination Gi1/0/24: 1 Gb/s\nsource peak mirrored rate: 1.6 Gb/s\nanalyzer capture: intermittent gaps", [1, 3], four(
    choice("The session has no configured source", "Gi1/0/5 is configured as a source."),
    choice("Mirrored traffic can exceed destination capacity", "The source peak 1.6 Gb/s exceeds the 1 Gb/s destination."),
    choice("The analyzer is guaranteed to receive every packet", "Intermittent capture gaps are reported."),
    choice("Capture gaps may reflect oversubscription rather than absent source traffic", "The mirror output can be dropped when the destination is undersized.")
  ))),

  group("ip-sla-object-tracking", [
    single("ip-sla-object-tracking", 1, "What is the role of an IP SLA operation used with object tracking?", 0, four(
      choice("Actively measure a selected reachability or service condition", "IP SLA generates probes to measure a path or service."),
      choice("Advertise a route without checking network state", "Tracking ties decisions to measured state rather than unconditional advertisement."),
      choice("Replace the routing table with probe results", "Probe state can influence policy, but it does not replace routes."),
      choice("Encrypt every data packet", "IP SLA is measurement, not encryption.")
    )),
    single("ip-sla-object-tracking", 2, "A static default route should be removed when an upstream target is unreachable. Which mechanism links probe state to route choice?", 2, four(
      choice("SPAN session", "SPAN copies packets for monitoring and does not control routing."),
      choice("DHCP snooping", "DHCP snooping protects address assignment, not static-route availability."),
      choice("An object track tied to the IP SLA result and route", "Tracking can withdraw or alter a route when the measured condition fails."),
      choice("An SNMP trap destination", "A trap reports events but does not itself change route selection.")
    )),
    single("ip-sla-object-tracking", 3, "An IP SLA ICMP probe succeeds, but users report that an application is down. What is a limitation of the probe?", 3, four(
      choice("ICMP probes can never cross a router", "ICMP is routable unless policy blocks it."),
      choice("A successful probe always certifies every application component", "One synthetic destination does not test the full application."),
      choice("Tracking cannot use IP SLA state", "Tracking can consume operation status."),
      choice("The probe may not represent the service path, protocol, source, or application dependency", "Synthetic tests verify only their configured target and conditions.")
    )),
    single("ip-sla-object-tracking", 4, "A tracked route repeatedly switches during brief loss bursts. Which adjustment is most appropriate after checking probe validity?", 1, four(
      choice("Disable every alternate route", "Removing fallback increases outage risk."),
      choice("Tune thresholds/delay and probe frequency to tolerate expected transient variation", "Hysteresis and suitable timing can reduce route flapping while preserving detection."),
      choice("Set the probe destination to a nonexistent address", "That makes the tracked state permanently fail."),
      choice("Increase the route's administrative distance until it is never selected", "This may defeat the intended failover rather than stabilize it.")
    ))
  ], [
    multi("ip-sla-object-tracking", 1, "Which two design details make an IP SLA-based failover probe meaningful?", [0, 3], four(
      choice("Choose a target and source that represent the service path being protected", "The probe must test the relevant path and source context."),
      choice("Probe the router's own loopback and infer remote availability", "A local loopback does not exercise the upstream path."),
      choice("Assume an ICMP response equals successful application transaction", "ICMP reachability may not represent application health."),
      choice("Define timeout, frequency, and failure/recovery behavior consistent with the service objective", "Probe timing controls detection and stability.")
    )),
    multi("ip-sla-object-tracking", 2, "Which two checks should follow a probe failure that triggered route failover?", [1, 2], four(
      choice("Delete the backup route before validating the new path", "Removing the fallback can interrupt service."),
      choice("Confirm the track state and resulting route-table change", "Verify the control decision actually occurred."),
      choice("Test application traffic and its return path through the alternate", "Failover must preserve end-to-end service."),
      choice("Assume a changed route proves the application is healthy", "Route installation alone does not validate the service.")
    ))
  ], ordered("ip-sla-object-tracking", "Build an IP SLA-controlled route failover with a verification step.", four(
    choice("Test failure and recovery, then verify the intended service path", "Controlled testing confirms behavior."),
    choice("Select a representative remote target and source", "Probe scope defines what availability is measured."),
    choice("Configure operation timing/thresholds and tracking linkage", "Measurement and track state are established."),
    choice("Tie track state to route or policy behavior", "The measured state can then influence forwarding.")
  ), [1, 2, 3, 0]), simlet("ip-sla-object-tracking", "Which two conclusions fit this illustrative failover status?", "SLA 10: icmp-echo 203.0.113.1 source Gi0/0, state Down\ntrack 10: Down, delay down 30s\nstatic default via 192.0.2.1 track 10: absent\nbackup default via 198.51.100.1: installed", [0, 3], four(
    choice("The tracked primary default is absent while its object is down", "The status shows the route removed with track 10 down."),
    choice("The SLA operation is currently successful", "Its current state is Down."),
    choice("The backup default is not installed", "The backup is shown installed."),
    choice("Forwarding has selected the backup default route", "The installed route points via 198.51.100.1.")
  ))),

  group("troubleshooting-method", [
    single("troubleshooting-method", 1, "Users report a service outage after a change. What is the most defensible first troubleshooting action?", 1, four(
      choice("Reboot every network device immediately", "A broad reboot destroys evidence and may expand the outage."),
      choice("Define scope, symptoms, timing, and recent changes; preserve evidence", "A bounded problem statement directs safe evidence gathering."),
      choice("Change routing metrics until the service responds", "Blind changes can mask the fault and create new problems."),
      choice("Assume the first alert names the root cause", "An alert is evidence, not necessarily a complete diagnosis.")
    )),
    single("troubleshooting-method", 2, "A route exists in a protocol database but users cannot reach the destination. Which sequence best separates the layers?", 3, four(
      choice("Check only the user's browser cache", "A browser cache cannot explain routing and forwarding state."),
      choice("Replace the access switch before checking route state", "This skips evidence and may be unrelated."),
      choice("Check DNS, then conclude the network is healthy if resolution works", "DNS success does not prove packet forwarding."),
      choice("Compare protocol learning, selected RIB route, FIB/adjacency, and end-to-end path", "Each stage can fail independently.")
    )),
    single("troubleshooting-method", 3, "Why should a sourced ping be used during a reachability investigation?", 0, four(
      choice("It tests forwarding using a specific source/interface or routing context", "Source selection can expose VRF, policy, or return-path differences."),
      choice("It guarantees application-layer success", "ICMP does not validate every application."),
      choice("It disables ACLs for the test", "A sourced probe remains subject to policy."),
      choice("It makes the route table irrelevant", "Routing still determines the probe path.")
    )),
    single("troubleshooting-method", 4, "After a network change restores service, what should be done before closing the incident?", 2, four(
      choice("Delete logs that predate the repair", "Preserving evidence supports audit and learning."),
      choice("Make another unrelated change to check stability", "Unrelated changes complicate cause-and-effect."),
      choice("Validate the affected application, failure path, and monitoring; document cause and rollback", "Verification and a clear record confirm recovery and future operability."),
      choice("Stop checking once one ping succeeds", "A single probe is insufficient proof of service recovery.")
    ))
  ], [
    multi("troubleshooting-method", 1, "Which two practices reduce risk while isolating a network fault?", [0, 2], four(
      choice("Change one hypothesis at a time with a documented rollback", "Controlled changes preserve cause-and-effect and recovery."),
      choice("Apply a broad configuration replacement before capture", "This increases scope and destroys diagnostic clarity."),
      choice("Correlate independent evidence such as logs, counters, and sourced tests", "Multiple evidence sources strengthen the diagnosis."),
      choice("Ignore return traffic because forward probes succeed", "Asymmetric return paths can still break sessions.")
    )),
    multi("troubleshooting-method", 2, "Which two findings distinguish route learning from actual forwarding?", [1, 3], four(
      choice("The route is present in a protocol database, therefore traffic must flow", "Protocol learning alone does not guarantee selection or forwarding."),
      choice("The route is installed in the relevant RIB with a resolved next hop", "RIB selection and recursion are necessary stages."),
      choice("The destination hostname resolves to an IP", "DNS is not evidence that the route is installed."),
      choice("The FIB/adjacency and forward-and-return test succeed", "These validate programmed forwarding and end-to-end behavior.")
    ))
  ], ordered("troubleshooting-method", "Use a controlled evidence-driven incident workflow.", four(
    choice("Apply a minimal change with rollback and test the service", "A controlled repair verifies the hypothesis."),
    choice("Define impact, time window, and recent changes", "The problem must be bounded before diagnosis."),
    choice("Gather independent control-plane, forwarding, and telemetry evidence", "Evidence identifies the failing layer."),
    choice("Form a testable hypothesis and predict an observation", "A hypothesis guides a targeted, falsifiable test.")
  ), [1, 2, 3, 0]), simlet("troubleshooting-method", "Which two conclusions are justified by this illustrative incident evidence?", "15:02 syslog: uplink Gi0/1 down\n15:03 OSPF neighbor 10.0.0.2 down\n15:04 IP SLA to app VIP: 100% loss\n15:05 interface Gi0/2 counters: no errors, link up", [0, 2], four(
    choice("The uplink failure preceded the OSPF and service-probe failures", "The timestamps show the interface event first."),
    choice("Gi0/2 is proven to be the root cause", "Gi0/2 is up with no errors and no evidence implicates it."),
    choice("The evidence supports investigating the Gi0/1 path and its routing impact", "The link event and subsequent neighbor/probe loss correlate."),
    choice("The application VIP is proven down at the server", "The probe fails, but this does not isolate server versus network path.")
  ))),

  group("aaa-tacacs-radius", [
    single("aaa-tacacs-radius", 1, "Which AAA function determines what an authenticated administrator is allowed to do?", 2, four(
      choice("Accounting", "Accounting records actions but does not grant permissions."),
      choice("Authentication", "Authentication establishes identity."),
      choice("Authorization", "Authorization applies permissions after identity is established."),
      choice("Encryption", "Encryption protects data in transit rather than assign commands.")
    )),
    single("aaa-tacacs-radius", 2, "Why might TACACS+ be selected for centralized network-device administration?", 1, four(
      choice("It is an Ethernet link aggregation protocol", "TACACS+ is an AAA protocol, not LACP."),
      choice("It separates authentication, authorization, and accounting and can support command authorization", "This enables centralized identity and per-command controls."),
      choice("It automatically provides Wi-Fi radio coverage", "TACACS+ does not provide RF access."),
      choice("It replaces all local emergency accounts", "A protected local fallback may still be important.")
    )),
    single("aaa-tacacs-radius", 3, "A device loses connectivity to its AAA servers during maintenance. Which design feature limits administrative lockout risk?", 0, four(
      choice("A tested, restricted local fallback account and console recovery", "A controlled fallback preserves access during server or network failure."),
      choice("Remove every local credential before testing", "Removing fallback can create lockout."),
      choice("Permit anonymous administrative access", "Anonymous access is unsafe."),
      choice("Use the same shared password on all network devices", "Shared credentials undermine accountability and security.")
    )),
    single("aaa-tacacs-radius", 4, "What should be done before enforcing a new centralized authorization policy on all devices?", 3, four(
      choice("Disable authentication on all devices", "Disabling identity controls is unsafe."),
      choice("Assume the policy server is always reachable", "Server availability and fallback need validation."),
      choice("Apply it globally without a rollback path", "A broad untested change can lock out operators."),
      choice("Pilot least-privilege roles, test fallback, and verify accounting/audit records", "Staged validation checks access, recovery, and accountability.")
    ))
  ], [
    multi("aaa-tacacs-radius", 1, "Which two controls improve centralized AAA security and accountability?", [0, 3], four(
      choice("Use individual identities and least-privilege authorization", "Unique accounts and restricted roles support accountability."),
      choice("Share one administrator account for faster operations", "Shared identities prevent reliable attribution."),
      choice("Allow all authenticated users full privilege", "Authentication does not justify unrestricted authorization."),
      choice("Protect server communication and retain auditable accounting records", "Secure transport and logs help protect and trace administrative actions.")
    )),
    multi("aaa-tacacs-radius", 2, "Which two failure-mode checks should be part of AAA rollout testing?", [1, 2], four(
      choice("Verify only the successful login path", "Success testing does not cover server failure or privilege assignment."),
      choice("Confirm behavior when primary and secondary AAA servers are unavailable", "Failover and fallback determine recovery from outages."),
      choice("Verify authorized and denied commands under intended roles", "Authorization tests confirm the actual privilege boundary."),
      choice("Disable console access during the change", "Console recovery should remain available.")
    ))
  ], ordered("aaa-tacacs-radius", "Process a privileged AAA request with auditable authorization.", four(
    choice("Record the session/action outcome through accounting", "Accounting records activity."),
    choice("Identify the administrator and authenticate credentials", "Authentication verifies identity."),
    choice("Evaluate role and command authorization", "Authorization controls permissible actions."),
    choice("Permit or reject the requested command and return a result", "The device enforces the decision.")
  ), [1, 2, 3, 0]), simlet("aaa-tacacs-radius", "Which two findings explain why this illustrative operator can log in but cannot run a command?", "TACACS+ authentication: success for user m.rivera\nauthorization profile: net-readonly\ncommand 'configure terminal': denied\naccounting: command denial recorded", [0, 2], four(
    choice("Identity authentication succeeded", "The output reports authentication success."),
    choice("The accounting service failed to record the attempt", "The command denial is recorded in accounting."),
    choice("The user has a read-only authorization profile", "The profile limits the permitted command set."),
    choice("The device is unable to contact the TACACS+ server", "The output shows successful authentication and authorization response.")
  ))),

  group("dot1x-access-control", [
    single("dot1x-access-control", 1, "What role does an authenticator switch port play in 802.1X access control?", 3, four(
      choice("It acts as the identity provider for every user", "The switch relays authentication; a backend server may validate credentials."),
      choice("It assigns an IPv6 prefix without checking identity", "Address assignment is separate from port access control."),
      choice("It encrypts all traffic with MACsec automatically", "802.1X authentication does not inherently encrypt the link."),
      choice("It controls port access while relaying supplicant credentials to an authentication server", "The switch acts as authenticator between endpoint and RADIUS service.")
    )),
    single("dot1x-access-control", 2, "A laptop sends no EAPOL response on an 802.1X port. Which behavior may be configured for an endpoint that cannot authenticate?", 0, four(
      choice("A deliberate guest, critical-auth, or restricted fallback policy", "Fallback behavior can provide bounded access when 802.1X is unavailable or unsupported."),
      choice("Unrestricted access to every VLAN", "Unrestricted fallback defeats admission control."),
      choice("Disable all logging on the switch", "Logging helps diagnose authentication behavior."),
      choice("Force the endpoint into the management network without authorization", "Management access should remain restricted.")
    )),
    single("dot1x-access-control", 3, "The RADIUS server accepts credentials, but the client receives the wrong network segment. What should be inspected?", 1, four(
      choice("The AP's radio transmit power", "The issue concerns wired admission attributes and role assignment."),
      choice("RADIUS authorization result and switch policy/VLAN or role mapping", "Authentication can succeed while returned authorization attributes are mapped incorrectly."),
      choice("The syslog collector's disk size", "Storage capacity does not select a port VLAN."),
      choice("The device's BGP router ID", "BGP identity is unrelated to access authorization.")
    )),
    single("dot1x-access-control", 4, "Why should 802.1X deployment include a recovery/critical-auth design?", 2, four(
      choice("802.1X disables RADIUS server dependence", "The switch commonly depends on RADIUS for authentication."),
      choice("EAPOL is a routing protocol", "EAPOL supports link-layer authentication, not IP routing."),
      choice("A RADIUS outage or non-supplicant endpoint can otherwise disrupt legitimate access", "Failure cases require an explicit restricted behavior."),
      choice("Every endpoint is guaranteed to support the same EAP method", "Endpoint capabilities and methods can vary.")
    ))
  ], [
    multi("dot1x-access-control", 1, "Which two components participate in a typical 802.1X access exchange?", [0, 2], four(
      choice("Supplicant on the endpoint", "The supplicant presents credentials or identity evidence."),
      choice("BGP route reflector", "BGP route reflection is unrelated to port authentication."),
      choice("Authenticator such as an access switch, with a RADIUS backend", "The switch relays EAP-related authentication to the server."),
      choice("IGMP querier", "IGMP manages multicast membership.")
    )),
    multi("dot1x-access-control", 2, "Which two checks are appropriate when a valid user is repeatedly denied at an 802.1X port?", [1, 3], four(
      choice("Disable port security on every access switch immediately", "A broad change is not diagnostic and reduces protection."),
      choice("Inspect EAP method/certificate compatibility and RADIUS response", "Credential, certificate, or method mismatch can cause rejection."),
      choice("Check only the endpoint's default gateway", "Layer 3 routing is downstream of authentication."),
      choice("Verify switch-to-RADIUS reachability, shared configuration, and policy mapping", "Transport and server policy determine the authorization result.")
    ))
  ], ordered("dot1x-access-control", "Establish a controlled 802.1X access session.", four(
    choice("Apply the returned authorization role and open the permitted access", "Authorization is enforced on the port."),
    choice("Endpoint supplicant sends identity/EAP response", "The endpoint begins the exchange."),
    choice("Authenticator relays the exchange to RADIUS", "The switch passes authentication information to the server."),
    choice("RADIUS validates identity and returns accept/reject plus policy", "The server decides authentication and authorization.")
  ), [1, 2, 3, 0]), simlet("dot1x-access-control", "Which two interpretations fit this illustrative access-session output?", "Gi1/0/8: 802.1X authenticated\nRADIUS result: Access-Accept\nassigned role: contractor\nVLAN mapping: role contractor -> VLAN 40\nclient IP: 10.40.8.21/24", [0, 3], four(
    choice("Authentication succeeded on Gi1/0/8", "The port status explicitly reports authenticated."),
    choice("The RADIUS server rejected the endpoint", "The response is Access-Accept."),
    choice("The endpoint received the contractor role", "The assigned role is shown as contractor."),
    choice("The access session is configured for VLAN 40", "The role mapping and address indicate VLAN 40.")
  ))),

  group("trustsec-macsec", [
    single("trustsec-macsec", 1, "What does a Security Group Tag (SGT) represent in a TrustSec policy design?", 1, four(
      choice("A cryptographic key for encrypting every packet", "SGT is a policy label, not a key."),
      choice("A group/role classification that can be used in identity-aware policy", "SGT associates traffic with a security group for policy decisions."),
      choice("An OSPF area number", "SGT does not identify routing areas."),
      choice("A VLAN trunk native identifier", "SGT is distinct from VLAN tagging.")
    )),
    single("trustsec-macsec", 2, "What security property does MACsec provide on a supported Ethernet link?", 3, four(
      choice("End-to-end application authentication across every routed hop", "MACsec protects a Layer 2 link, not every routed end-to-end path."),
      choice("Automatic BGP route filtering", "MACsec does not filter routing advertisements."),
      choice("A replacement for endpoint identity policy", "MACsec link protection and identity policy are different controls."),
      choice("Link-layer frame confidentiality and integrity protection", "MACsec can protect frames between supported adjacent peers.")
    )),
    single("trustsec-macsec", 3, "A packet reaches a policy point with no expected SGT. Which aspect should be checked first?", 0, four(
      choice("Identity-to-group assignment and tag propagation or inline-tagging support", "A missing label can result from assignment or transport behavior."),
      choice("The router's DNS search suffix", "DNS does not assign or carry SGTs."),
      choice("STP path cost to the root", "STP cost does not directly populate the security group."),
      choice("The endpoint's DHCP lease duration", "Lease duration does not determine SGT assignment.")
    )),
    single("trustsec-macsec", 4, "Why should MACsec keying and peer compatibility be tested before broad enablement?", 2, four(
      choice("It changes IPv4 addresses on the link", "MACsec does not assign IP addresses."),
      choice("It automatically opens all ACLs", "MACsec does not replace network access policy."),
      choice("Mismatched key agreement or unsupported peers can disrupt link traffic", "Peers must support and agree on the protection configuration."),
      choice("It eliminates the need for physical link monitoring", "Link health still needs monitoring.")
    ))
  ], [
    multi("trustsec-macsec", 1, "Which two statements accurately distinguish TrustSec SGT policy from MACsec?", [0, 3], four(
      choice("SGT is a group label used by identity-aware policy", "The label conveys a security-group classification."),
      choice("SGT itself encrypts Ethernet frames", "The tag is not encryption."),
      choice("MACsec assigns user roles based on RADIUS attributes", "MACsec provides link protection, not identity role assignment."),
      choice("MACsec protects supported Layer 2 links against eavesdropping/tampering", "MACsec provides link-level confidentiality and integrity.")
    )),
    multi("trustsec-macsec", 2, "Which two design checks improve TrustSec policy correctness?", [1, 2], four(
      choice("Treat every unlabeled packet as an administrator by default", "That would grant excessive privilege."),
      choice("Verify identity-to-SGT assignment and the enforcement matrix", "Correct classification and policy mapping are both necessary."),
      choice("Confirm tags are preserved or reclassified at domain boundaries", "SGT propagation behavior affects downstream decisions."),
      choice("Assume an SGT replaces routing and ACL design everywhere", "SGT policy complements network reachability and other controls.")
    ))
  ], ordered("trustsec-macsec", "Apply identity classification and link protection at their respective stages.", four(
    choice("Evaluate the classified group's access at the policy enforcement point", "The enforcement point applies group policy."),
    choice("Authenticate endpoint/user and determine the identity context", "Identity is the basis for classification."),
    choice("Assign or propagate the appropriate security group tag", "Classification carries group context."),
    choice("Protect supported adjacent links with compatible MACsec settings", "Link-layer protection is configured on the supported hop.")
  ), [1, 2, 0, 3]), simlet("trustsec-macsec", "Which two findings are supported by this illustrative security status?", "endpoint identity: employee-42\nassigned SGT: 12 (staff)\npolicy: SGT 12 -> app-zone permit tcp/443\naccess link MACsec: secured, integrity+confidentiality", [0, 2], four(
    choice("The endpoint is classified as SGT 12 (staff)", "The identity record shows the assigned group."),
    choice("MACsec is disabled on the access link", "The link status is secured."),
    choice("The displayed policy permits TCP/443 from this group to app-zone", "That rule is explicitly listed."),
    choice("All traffic from staff is permitted to every destination", "The displayed permit is limited to app-zone TCP/443.")
  ))),

  group("control-plane-policing", [
    single("control-plane-policing", 1, "What is the main purpose of Control Plane Policing (CoPP)?", 0, four(
      choice("Limit and protect traffic destined to the router CPU", "CoPP controls punted/control-plane traffic to protect CPU resources."),
      choice("Shape all user traffic leaving every interface", "Egress user shaping is a different QoS function."),
      choice("Encrypt routing updates between peers", "CoPP does not provide encryption."),
      choice("Filter all packets in hardware before any forwarding", "CoPP specifically protects control-plane traffic, not all transit packets.")
    )),
    single("control-plane-policing", 2, "A CoPP policy drops legitimate routing hellos during a traffic surge. What is the most appropriate response?", 2, four(
      choice("Remove all control-plane protection permanently", "Removing protection exposes the CPU to overload."),
      choice("Raise every class limit without inspecting counters", "Unmeasured changes may leave the issue or weaken protection."),
      choice("Review class matching, rates, and drop counters; tune narrowly for required control traffic", "Evidence-based class tuning protects CPU while preserving required protocols."),
      choice("Apply the policy to the user access VLAN only", "CoPP applies to traffic directed to the control plane.")
    )),
    single("control-plane-policing", 3, "Why should transit traffic and CPU-destined traffic be distinguished during a CoPP investigation?", 1, four(
      choice("CoPP is a routing protocol that forwards transit packets", "CoPP is a protection policy, not a forwarding protocol."),
      choice("CoPP is intended for traffic processed by the control plane, not general transit forwarding", "This distinguishes CPU protection from data-plane policy."),
      choice("Transit packets always use the router CPU", "Hardware forwarding commonly handles transit traffic."),
      choice("CPU traffic cannot be rate limited", "Control-plane classes can be policed.")
    )),
    single("control-plane-policing", 4, "What is a useful indicator that a CoPP class may be too restrictive?", 3, four(
      choice("A route has a longer AS_PATH", "AS_PATH length does not indicate CoPP drops."),
      choice("An endpoint receives a DHCP lease", "Lease success does not measure CPU class policing."),
      choice("The router's serial number changes", "Serial number changes are unrelated."),
      choice("Required control protocols show matching class drop counters and adjacency symptoms", "Counters correlated with protocol failure indicate possible misclassification or undersizing.")
    ))
  ], [
    multi("control-plane-policing", 1, "Which two principles should guide a CoPP policy?", [0, 3], four(
      choice("Classify required control-plane traffic deliberately", "Specific classes help protect essential CPU functions."),
      choice("Permit unlimited packets to the CPU from any source", "Unrestricted traffic defeats control-plane protection."),
      choice("Use identical rates for every protocol without measurement", "Different control traffic has different needs and rates."),
      choice("Monitor class counters and tune limits based on platform capacity and evidence", "Counters help balance protection with operational requirements.")
    )),
    multi("control-plane-policing", 2, "Which two symptoms warrant checking CoPP counters?", [1, 2], four(
      choice("A file download is slow but no CPU-destined traffic is involved", "This alone does not implicate control-plane policing."),
      choice("Routing adjacencies flap during a control-plane traffic burst", "Required control packets may be dropped under load."),
      choice("Management access intermittently fails while CPU punt queues drop", "CPU-bound management traffic can be affected by CoPP."),
      choice("An access VLAN's native ID is different", "Native VLAN mismatch is not a CoPP counter symptom.")
    ))
  ], ordered("control-plane-policing", "Investigate a suspected control-plane policing issue safely.", four(
    choice("Adjust only the affected class and validate service plus protection", "A narrow change is tested after diagnosis."),
    choice("Identify affected control protocols and the incident time window", "Scope correlates symptoms to controls."),
    choice("Inspect CoPP class matches, rates, and drop counters", "Counters reveal which traffic is affected."),
    choice("Correlate counters with CPU, adjacency, and management evidence", "Independent data confirms whether the policy is causal.")
  ), [1, 2, 3, 0]), simlet("control-plane-policing", "Which two conclusions follow from this illustrative CoPP snapshot?", "class routing-control: offered 1,200 pps, configured 1,500 pps, drops 0\nclass mgmt-ssh: offered 900 pps, configured 200 pps, drops 700\nCPU utilization: 38%\nSSH sessions: intermittent timeout", [1, 3], four(
    choice("Routing-control traffic is currently being dropped", "The routing class reports zero drops."),
    choice("The SSH management class is oversubscribed against its configured rate", "Offered 900 pps exceeds 200 pps with 700 drops."),
    choice("The router CPU is at 100 percent", "CPU utilization is 38%."),
    choice("The SSH symptoms correlate with drops in the management class", "The status shows intermittent SSH timeout alongside management-class drops.")
  ))),

  group("layer2-hardening", [
    single("layer2-hardening", 1, "What does DHCP snooping primarily help prevent on a switched access network?", 2, four(
      choice("Unauthorized OSPF route advertisements", "DHCP snooping does not filter OSPF."),
      choice("MACsec key mismatch on an uplink", "DHCP snooping is not link encryption."),
      choice("Rogue DHCP server responses from untrusted ports", "The feature distinguishes trusted DHCP server-facing ports from untrusted access ports."),
      choice("IPv6 neighbor discovery on every interface", "DHCP snooping concerns DHCP traffic, not all ND.")
    )),
    single("layer2-hardening", 2, "Why should DHCP snooping trust be applied narrowly?", 0, four(
      choice("A rogue server on a trusted port can bypass the intended DHCP response restriction", "Trusting the wrong edge port weakens the protection."),
      choice("Trusted ports cannot carry VLAN tags", "Trust status does not determine trunk tagging."),
      choice("It disables all client DHCP requests", "Client requests can be forwarded from untrusted ports."),
      choice("It forces every client to use static addressing", "DHCP snooping does not prohibit client DHCP.")
    )),
    single("layer2-hardening", 3, "What security benefit can Dynamic ARP Inspection provide when correctly integrated with DHCP snooping?", 1, four(
      choice("It encrypts ARP packets across routers", "DAI does not encrypt ARP."),
      choice("It validates ARP messages against trusted bindings/policy to reduce spoofing", "DAI can inspect ARP sender information against bindings."),
      choice("It prevents all Layer 2 loops", "STP, not DAI, prevents bridging loops."),
      choice("It assigns IP addresses to hosts", "DHCP provides address allocation.")
    )),
    single("layer2-hardening", 4, "A newly connected legitimate device is blocked after enabling DHCP snooping. What should be checked before disabling the feature?", 3, four(
      choice("The switch's BGP peer password", "BGP authentication does not explain DHCP binding state."),
      choice("The device's browser version", "Browser software does not determine DHCP snooping validation."),
      choice("The spanning-tree bridge priority only", "STP priority does not create DHCP snooping bindings."),
      choice("VLAN/interface trust, DHCP binding state, and rate/option policy", "A binding or trust misconfiguration can block valid DHCP exchanges.")
    ))
  ], [
    multi("layer2-hardening", 1, "Which two Layer 2 hardening practices are appropriate on endpoint-facing access ports?", [0, 2], four(
      choice("Use edge-port protections such as BPDU Guard where appropriate", "This protects against an unexpected bridge on a host port."),
      choice("Allow dynamic trunk formation from untrusted endpoints", "Endpoint ports should not negotiate trunks unnecessarily."),
      choice("Limit allowed VLANs and disable unused access ports", "Reducing exposure limits unintended connectivity."),
      choice("Trust DHCP server messages on every user port", "That allows rogue server replies from endpoints.")
    )),
    multi("layer2-hardening", 2, "Which two checks help diagnose DHCP snooping or ARP inspection blocking a host?", [1, 3], four(
      choice("Check the host's monitor brightness", "Display settings cannot affect Ethernet security checks."),
      choice("Verify the DHCP binding table and interface/VLAN trust state", "The binding and trust state govern validation."),
      choice("Disable spanning tree on the VLAN", "STP removal increases loop risk and does not repair binding state."),
      choice("Inspect violation/drop counters and any static-host exceptions", "Counters and intended exceptions explain blocked legitimate traffic.")
    ))
  ], ordered("layer2-hardening", "Enable Layer 2 DHCP/ARP protections without blocking legitimate clients.", four(
    choice("Validate legitimate address assignment and inspect violation counters", "Final testing confirms protection and service."),
    choice("Identify DHCP server-facing trusted interfaces and client VLANs", "Trust boundaries must reflect actual topology."),
    choice("Enable snooping and verify bindings form for clients", "Bindings provide evidence for later validation."),
    choice("Apply dependent ARP validation and port-edge protections where supported", "Dependent controls use the learned trust state.")
  ), [1, 2, 3, 0]), simlet("layer2-hardening", "Which two findings explain why DHCP replies from the approved server are discarded?", "VLAN 40 DHCP snooping: enabled\nGi1/0/48 -> server: untrusted, drops 26\nGi1/0/12 -> client: untrusted, requests forwarded\nbinding table: client entry pending", [0, 2], four(
    choice("The server-facing Gi1/0/48 is configured as untrusted", "The output explicitly marks the server-facing port untrusted."),
    choice("DHCP snooping is disabled for VLAN 40", "Snooping is reported enabled."),
    choice("The server-facing trust boundary needs correction after validating the topology", "Server replies from the untrusted uplink are being dropped."),
    choice("The client port is configured as trusted", "The client port is shown untrusted.")
  ))),

  group("ipv4-ipv6-acl-policy", [
    single("ipv4-ipv6-acl-policy", 1, "An extended IPv4 ACL has a specific permit followed by a deny. Why does rule order matter?", 3, four(
      choice("The router randomly selects one matching entry", "ACLs are evaluated deterministically in sequence."),
      choice("The last matching line always takes precedence", "Evaluation stops at the first matching entry."),
      choice("The ACL implicitly permits all unmatched traffic", "There is an implicit deny at the end of a standard ACL policy."),
      choice("The first matching ACE determines the packet's action", "Ordered ACL processing makes earlier entries decisive.")
    )),
    single("ipv4-ipv6-acl-policy", 2, "A policy must permit HTTPS to one server while denying other traffic from a subnet. What is essential when writing the ACL?", 0, four(
      choice("Place a sufficiently specific permit before the broader deny", "The first-match rule requires the exception before the catch-all."),
      choice("Put a broad deny first and expect a later permit to override it", "Later ACEs are not reached after the earlier match."),
      choice("Use only a standard ACL regardless of port requirement", "A standard ACL cannot match TCP destination port."),
      choice("Remove the implicit deny by changing the subnet mask", "Mask selection does not remove the implicit deny.")
    )),
    single("ipv4-ipv6-acl-policy", 3, "Why should IPv6 ACLs preserve required ICMPv6 messages?", 2, four(
      choice("ICMPv6 is used only by DNS", "ICMPv6 has essential network control functions."),
      choice("IPv6 has no transport-layer ports", "IPv6 supports TCP/UDP ports."),
      choice("Neighbor Discovery and Path MTU Discovery depend on ICMPv6", "Broad filtering can break address resolution and PMTUD."),
      choice("IPv6 ACLs automatically permit every packet", "IPv6 ACL behavior still requires explicit policy and has defined defaults.")
    )),
    single("ipv4-ipv6-acl-policy", 4, "A newly applied ACL blocks traffic unexpectedly. Which evidence helps identify the precise ACE?", 1, four(
      choice("Only the ACL name", "A name does not show which rule matched."),
      choice("Hit counters, sequence/order, source/destination, and direction of application", "Counters and attachment context reveal the matching rule."),
      choice("The switch's physical rack location", "Rack location does not identify packet matching."),
      choice("The endpoint's DNS suffix", "DNS suffix does not explain ACL sequence.")
    ))
  ], [
    multi("ipv4-ipv6-acl-policy", 1, "Which two practices reduce accidental ACL policy errors?", [0, 3], four(
      choice("Order specific exceptions before broader rules and review implicit deny", "Rule order and default behavior determine final access."),
      choice("Assume a later permit overrides an earlier deny", "ACL processing typically stops at the first match."),
      choice("Apply an IPv4 ACL to IPv6 packets without checking support", "Address-family policy must be explicit."),
      choice("Test representative allowed and denied flows in both directions", "Bidirectional tests reveal attachment and return-path problems.")
    )),
    multi("ipv4-ipv6-acl-policy", 2, "Which two details are needed to evaluate whether a packet matches an extended ACL entry?", [1, 2], four(
      choice("The switch's serial number", "Serial number does not affect packet matching."),
      choice("Protocol and source/destination addresses", "Extended ACLs match these fields."),
      choice("Source/destination ports and ACE order where applicable", "Port predicates and first-match sequence matter."),
      choice("The endpoint's display resolution", "Display resolution is unrelated.")
    ))
  ], ordered("ipv4-ipv6-acl-policy", "Evaluate a packet against an ordered ACL and verify its effect.", four(
    choice("Apply the first matching ACE or implicit deny", "The match determines the action."),
    choice("Identify address family, protocol, addresses, and ports", "Packet fields are needed for comparison."),
    choice("Read ACEs from top to bottom in configured order", "ACLs are evaluated sequentially."),
    choice("Check the interface/direction and test the return path", "Attachment context and reverse traffic affect actual service.")
  ), [1, 2, 0, 3]), simlet("ipv4-ipv6-acl-policy", "Which two conclusions follow from this illustrative ACL counter output?", "inbound ACL WEB-IN on Gi0/0\n10 permit tcp 10.4.0.0/16 host 192.0.2.20 eq 443 (hits 120)\n20 deny ip 10.4.0.0/16 any (hits 38)\nimplicit deny (hits 7)", [0, 2], four(
    choice("Some HTTPS flows from 10.4.0.0/16 to 192.0.2.20 match the permit", "The permit ACE has 120 hits."),
    choice("The broad deny is evaluated before the HTTPS permit", "The permit is sequence 10 and the deny is 20."),
    choice("Some subnet traffic matched the broader deny", "The deny ACE records 38 hits."),
    choice("The implicit deny has no observed matches", "The implicit deny counter shows 7.")
  ))),

  group("netconf-restconf-yang", [
    single("netconf-restconf-yang", 1, "What role does YANG play with NETCONF or RESTCONF?", 1, four(
      choice("It is the encrypted transport protocol for every network API", "YANG is not a transport protocol."),
      choice("It models configuration and operational data structures", "YANG schemas describe data exchanged by management protocols."),
      choice("It is a packet-capture format", "YANG is not a packet trace format."),
      choice("It replaces authentication and authorization", "Access control is provided separately.")
    )),
    single("netconf-restconf-yang", 2, "What is a common transport difference between NETCONF and RESTCONF?", 3, four(
      choice("NETCONF always uses UDP; RESTCONF uses Ethernet", "NETCONF commonly uses SSH, and RESTCONF uses HTTP-based transport."),
      choice("Both are routing protocols", "They are device management protocols."),
      choice("RESTCONF cannot use HTTPS", "RESTCONF commonly uses HTTP/HTTPS."),
      choice("NETCONF commonly uses SSH; RESTCONF exposes HTTP-based resources", "This distinguishes their common transport/API styles.")
    )),
    single("netconf-restconf-yang", 3, "A NETCONF edit is accepted but does not produce the intended running configuration. Which capability may be needed for atomic validation before commit?", 0, four(
      choice("A candidate datastore with validation and confirmed commit where supported", "Candidate workflows can validate changes before applying them."),
      choice("An SNMP trap receiver", "Traps report events and do not validate a configuration transaction."),
      choice("An Ethernet SPAN session", "Packet mirroring does not stage configuration."),
      choice("A DNS zone transfer", "DNS synchronization is unrelated.")
    )),
    single("netconf-restconf-yang", 4, "An API client receives an authorization error from a RESTCONF endpoint. What should be checked?", 2, four(
      choice("The device's STP root for the RESTCONF VLAN only", "STP root status does not grant API authorization."),
      choice("The JSON key order in the response", "Key order does not resolve server-side access policy."),
      choice("HTTPS/API authentication, user privilege, and resource authorization", "Transport identity and permission determine access to the resource."),
      choice("The route metric for every remote subnet", "A completed authorization response is a policy issue, not necessarily a routing issue.")
    ))
  ], [
    multi("netconf-restconf-yang", 1, "Which two benefits can model-driven NETCONF/RESTCONF workflows provide?", [0, 2], four(
      choice("Structured data that can be validated against a model", "Schema-aware data is less ambiguous than unstructured CLI text."),
      choice("A guarantee that every device implements identical models", "Model and feature support varies by platform and software."),
      choice("Transactional or resource-oriented operations with explicit responses", "The APIs provide structured operations and results."),
      choice("Automatic approval of any configuration change", "Automation still needs policy, review, and authorization.")
    )),
    multi("netconf-restconf-yang", 2, "Which two safeguards should an automation client use before changing a device via a model-driven API?", [1, 3], four(
      choice("Disable TLS verification to avoid certificate errors", "Skipping certificate verification weakens server identity checks."),
      choice("Check supported YANG model/revision and validate payload structure", "Capabilities and schema validation prevent unsupported or malformed changes."),
      choice("Use a shared administrator password embedded in source", "Embedded shared secrets are unsafe."),
      choice("Use least-privilege credentials and verify the resulting state", "Restricted access and post-change checks reduce risk.")
    ))
  ], ordered("netconf-restconf-yang", "Perform a controlled model-driven configuration change.", four(
    choice("Read back state and verify intended operational behavior", "Post-change verification confirms effect."),
    choice("Discover endpoint capabilities and supported YANG models", "Model support is checked before constructing a change."),
    choice("Build and validate the structured request against the model", "A valid payload is prepared."),
    choice("Authenticate, submit the edit, and inspect the server response/commit state", "The device processes the proposed change.")
  ), [1, 2, 3, 0]), simlet("netconf-restconf-yang", "Which two conclusions fit this illustrative NETCONF response?", "<rpc-reply>\n  <rpc-error><error-tag>unknown-element</error-tag>\n    <error-path>/interfaces/interface[name='Gi0/1']/foo</error-path>\n  </rpc-error>\n</rpc-reply>\nserver capability: model revision 2024-01", [0, 3], four(
    choice("The edit contains an element the server does not recognize at the reported path", "The error tag and path identify an unknown element."),
    choice("The change was confirmed committed successfully", "The response contains an rpc-error, not success."),
    choice("The server supports every model revision", "Only one server capability revision is shown."),
    choice("The payload should be compared with the device-supported model revision", "Model/revision alignment can explain an unsupported element.")
  ))),

  group("network-json-data", [
    single("network-json-data", 1, "In JSON, what is the difference between an object and an array?", 2, four(
      choice("Objects hold only numbers; arrays hold only strings", "Both JSON structures can contain values of multiple types."),
      choice("Objects cannot be nested", "JSON objects may be nested."),
      choice("Objects map string keys to values; arrays are ordered sequences", "Objects use named members, while arrays preserve element order."),
      choice("Arrays require unique keys", "Arrays contain values indexed by position, not keys.")
    )),
    single("network-json-data", 2, "An API returns `\"enabled\": \"false\"`. Why can this differ from a JSON boolean false?", 0, four(
      choice("The quoted value is a string, not a boolean literal", "JSON type matters: `false` is boolean, while `\"false\"` is text."),
      choice("JSON treats every quoted value as false", "Quoted content is a string regardless of its characters."),
      choice("The property is an array", "The value shown is a string."),
      choice("Both values are guaranteed to behave identically in validation", "Type-aware consumers distinguish strings from booleans.")
    )),
    single("network-json-data", 3, "A payload parses as JSON but fails the API's schema validation. What does this indicate?", 1, four(
      choice("The JSON parser is necessarily broken", "Successful parsing suggests syntax is valid."),
      choice("The structure or value types do not satisfy the expected schema", "Syntax correctness does not guarantee schema compliance."),
      choice("The API has accepted and applied the request", "A schema rejection means acceptance is not established."),
      choice("The payload is encrypted", "Schema validation is independent of encryption.")
    )),
    single("network-json-data", 4, "Why should an automation workflow validate API response types before using a field as a number?", 3, four(
      choice("JSON numbers cannot be compared", "Numbers can be compared when correctly typed."),
      choice("All JSON APIs return only strings", "JSON supports multiple value types."),
      choice("Type validation changes the device hostname", "Data validation does not configure the device."),
      choice("Strings, nulls, arrays, and numbers have different semantics and can break assumptions", "Explicit type checks prevent invalid calculations and unsafe dereferences.")
    ))
  ], [
    multi("network-json-data", 1, "Which two practices improve safe processing of network API JSON?", [0, 3], four(
      choice("Parse with a JSON parser instead of extracting values with brittle text matching", "A parser respects nesting and escaping."),
      choice("Assume object key order always conveys meaning", "JSON object member order should not be relied on for semantics."),
      choice("Treat every API response as trusted, even when it contains errors", "Responses need validation and error handling."),
      choice("Validate required keys and expected types before acting", "Schema checks guard subsequent automation logic.")
    )),
    multi("network-json-data", 2, "A nested response is missing a desired interface. Which two approaches are robust?", [1, 2], four(
      choice("Index blindly into the first array element", "Array ordering may not guarantee the desired interface."),
      choice("Check for missing/null fields and handle API error objects", "Defensive handling avoids runtime failures."),
      choice("Select the interface by a stable identifier such as its name", "Explicit identity is more reliable than position."),
      choice("Convert the entire response to a string and search for a substring", "Text matching can confuse nested or unrelated values.")
    ))
  ], ordered("network-json-data", "Validate an API JSON response before deriving a configuration action.", four(
    choice("Use validated values to construct the intended action", "Only validated data should drive a change."),
    choice("Parse the response as JSON", "Parsing establishes syntactic structure."),
    choice("Check required fields, types, and schema constraints", "Validation ensures the data is usable."),
    choice("Handle missing data and API errors without assuming success", "Error handling prevents unsafe assumptions.")
  ), [1, 2, 3, 0]), simlet("network-json-data", "Which two interpretations are correct for this illustrative API response?", "{\"interface\":\"Gi0/2\",\"enabled\":\"false\",\"mtu\":1500,\"addresses\":null}", [0, 2], four(
    choice("The value of enabled is a string, not a JSON boolean", "The value is enclosed in quotation marks."),
    choice("mtu is a string containing four digits", "1500 is an unquoted JSON number."),
    choice("addresses is explicitly null, not an empty array", "The literal is null."),
    choice("The response proves the interface is administratively disabled", "A string value may require schema interpretation; the response alone does not confirm device state.")
  ))),

  group("python-network-apis", [
    single("python-network-apis", 1, "Why should a Python client check an HTTP status code before parsing a response body as successful device data?", 1, four(
      choice("A status code contains the full configuration payload", "The body carries content; the status indicates request outcome."),
      choice("An error response may use a different body shape and must not be treated as success", "Status-aware handling prevents invalid data from driving automation."),
      choice("HTTP status codes encrypt credentials", "TLS provides transport confidentiality, not status codes."),
      choice("A successful status guarantees the device reached the intended configuration", "Server acceptance does not prove operational state.")
    )),
    single("python-network-apis", 2, "Which approach safely handles API credentials in a Python automation tool?", 3, four(
      choice("Commit passwords in a public configuration file", "Committed credentials can be exposed and reused."),
      choice("Print tokens to logs to simplify troubleshooting", "Logs may be retained or shared, exposing secrets."),
      choice("Disable TLS certificate validation on all requests", "This weakens server authentication."),
      choice("Load secrets from a protected runtime secret store and restrict access", "External protected secret handling avoids embedding credentials in code.")
    )),
    single("python-network-apis", 3, "A network API call intermittently times out. Which client behavior is most appropriate?", 0, four(
      choice("Use bounded timeouts and carefully limited retries for safe/idempotent operations", "Controlled retry behavior avoids hangs and duplicate side effects."),
      choice("Retry mutations forever without checking the result", "Unbounded retries can overload services or repeat a non-idempotent change."),
      choice("Treat timeout as proof the device rejected the request", "The request may have succeeded while the response was lost."),
      choice("Remove all error handling so exceptions stop the script", "Explicit exceptions and recovery make automation safer.")
    )),
    single("python-network-apis", 4, "Why is a dry-run or explicit diff useful before a Python tool applies configuration changes?", 2, four(
      choice("It guarantees the remote API cannot fail", "A diff does not guarantee successful execution."),
      choice("It automatically approves production changes", "Approval remains a separate process."),
      choice("It makes proposed state reviewable before side effects occur", "A diff exposes intended changes before applying them."),
      choice("It prevents the client from authenticating", "Authentication is independent of dry-run output.")
    ))
  ], [
    multi("python-network-apis", 1, "Which two practices make Python API automation more reliable?", [0, 3], four(
      choice("Validate response status, structure, and required fields", "Explicit validation catches server errors and schema changes."),
      choice("Assume every returned JSON document is a success", "An error response can also be valid JSON."),
      choice("Ignore exceptions and continue with partial state", "Continuing without known state risks unintended actions."),
      choice("Use bounded timeouts, logging without secrets, and actionable error handling", "These practices improve recovery and protect credentials.")
    )),
    multi("python-network-apis", 2, "Which two measures reduce risk when a Python script updates multiple devices?", [1, 2], four(
      choice("Run unreviewed changes against every device in parallel", "Unbounded rollout magnifies errors."),
      choice("Use inventory scoping, staged rollout, and explicit concurrency limits", "Controlled scope and rollout reduce blast radius."),
      choice("Verify post-change state and support rollback or compensation", "Verification catches drift and recovery planning limits impact."),
      choice("Suppress all output so failures cannot be observed", "Observability is necessary for safe operations.")
    ))
  ], ordered("python-network-apis", "Execute a safe Python-driven network API change.", four(
    choice("Apply approved changes and verify actual device state", "Execution follows review and is followed by verification."),
    choice("Load scoped inventory and credentials securely", "Targets and secrets are established safely."),
    choice("Read current state and validate API responses", "Known state is required before planning."),
    choice("Generate and review a diff, then obtain required approval", "The change is inspected before side effects.")
  ), [1, 2, 3, 0]), simlet("python-network-apis", "Which two conclusions follow from this illustrative client log?", "GET /api/interfaces -> HTTP 200\nJSON parse: success; interfaces: 24\nPATCH /api/interfaces/Gi0/2 -> timeout after 5s\nclient retry count: 0; change result: unknown", [0, 3], four(
    choice("The inventory read returned a successful HTTP response and parsed data", "GET returned 200 and parsing succeeded."),
    choice("The interface change is confirmed applied", "The PATCH timed out, leaving the result unknown."),
    choice("The API rejected the PATCH with HTTP 403", "No HTTP status response is shown."),
    choice("The client should read back state before deciding whether to retry", "A timed-out mutation may have succeeded, so verify current state first.")
  ))),

  group("ansible-network-automation", [
    single("ansible-network-automation", 1, "What is the primary benefit of an Ansible playbook for a repeated network configuration task?", 2, four(
      choice("It guarantees every platform uses identical commands", "Network modules and platform syntax vary."),
      choice("It removes the need for inventory or target scoping", "Inventory defines where automation runs."),
      choice("It describes ordered tasks that can be reviewed and reused", "Playbooks make operations repeatable and auditable."),
      choice("It replaces device authentication with SSH hostnames", "Authentication remains required.")
    )),
    single("ansible-network-automation", 2, "Why is idempotence valuable in network automation?", 0, four(
      choice("Repeated runs converge toward the declared state without unnecessary changes", "Idempotence reduces unintended repeated side effects."),
      choice("Every playbook command is executed exactly once forever", "Automation may run repeatedly; idempotence describes outcome, not one-time execution."),
      choice("It guarantees the desired state already exists", "The automation may need to change current state."),
      choice("It makes configuration rollback impossible", "Rollback remains a separate operational capability.")
    )),
    single("ansible-network-automation", 3, "Before running a playbook that changes access policies, what is the safest first execution practice?", 3, four(
      choice("Run against every production device with maximum forks", "A large uncontrolled rollout increases blast radius."),
      choice("Disable privilege escalation and ignore the resulting errors", "Required tasks may fail without appropriate permissions."),
      choice("Remove inventory groups so all hosts are implicitly selected", "Implicit target selection is unsafe."),
      choice("Limit targets, review the diff/check mode where supported, and stage rollout", "Scoped, previewable execution reduces risk.")
    )),
    single("ansible-network-automation", 4, "A playbook task reports changed, but the service is still down. What should the workflow include?", 1, four(
      choice("Treat changed status as proof of application health", "A configuration task result does not prove service behavior."),
      choice("Post-change assertions or operational checks against the desired outcome", "Verification confirms actual state and service health."),
      choice("Delete the inventory to stop future runs", "Inventory deletion does not validate or restore service."),
      choice("Repeat the same playbook without inspecting device state", "Repeated blind execution may worsen the problem.")
    ))
  ], [
    multi("ansible-network-automation", 1, "Which two controls are appropriate for an Ansible network rollout?", [0, 2], four(
      choice("Use an explicit inventory/group and narrow limit for the initial pilot", "Target scope should be intentional."),
      choice("Store plaintext credentials in a committed playbook", "Secrets should not be committed unprotected."),
      choice("Use protected secrets and reviewed variables/templates", "Secure variable handling and review reduce exposure and errors."),
      choice("Disable all failure reporting to keep the run green", "Failures must remain observable.")
    )),
    multi("ansible-network-automation", 2, "Which two Ansible behaviors should an operator understand before running a playbook?", [1, 3], four(
      choice("Every network module supports check mode identically", "Check-mode support depends on modules and platform."),
      choice("Task order and handlers can affect when configuration takes effect", "Playbook sequencing controls operations and notifications."),
      choice("Inventory variables never override defaults", "Ansible variable precedence can affect effective values."),
      choice("Idempotence and module support should be validated for the target platform", "Different network modules can have distinct capabilities and behavior.")
    ))
  ], ordered("ansible-network-automation", "Prepare and validate a staged Ansible network change.", four(
    choice("Verify device state and application outcome after the rollout", "Post-checks confirm intended effect."),
    choice("Select hosts and load protected connection variables", "Scope and access are prepared first."),
    choice("Render/validate intended configuration and review a preview", "The proposed changes are checked before execution."),
    choice("Apply to a pilot, inspect results, then expand in controlled stages", "Staged execution limits blast radius.")
  ), [1, 2, 3, 0]), simlet("ansible-network-automation", "Which two conclusions are supported by this illustrative Ansible run summary?", "PLAY [access switches] limit: edge-lab\nTASK configure_vlan: ok=2 changed=1 failed=0\nTASK verify_vlan: failed=1\nhost edge-02: VLAN 40 absent after task\nremaining inventory groups: campus-prod", [0, 2], four(
    choice("The run was limited to the edge-lab target scope", "The summary shows `limit: edge-lab`."),
    choice("All verification checks succeeded", "One verification task failed."),
    choice("A configuration task reported a change, but post-check failed on edge-02", "The counters and host result show this outcome."),
    choice("The playbook was run against campus-prod", "The output lists campus-prod as remaining inventory, not the selected limit.")
  ))),

  group("event-driven-automation", [
    single("event-driven-automation", 1, "What distinguishes event-driven automation from a fixed polling-only workflow?", 0, four(
      choice("A detected event can trigger a defined response workflow", "Event-driven systems react to event input rather than waiting only for a scheduled poll."),
      choice("It eliminates the need for event validation", "Events still need filtering and verification."),
      choice("It guarantees the triggering event is always correct", "Sensors can produce false or duplicate events."),
      choice("It changes network configuration without policies", "Actions should be governed by authorization and safeguards.")
    )),
    single("event-driven-automation", 2, "A link-flap alert triggers a remediation playbook twice for the same incident. Which control helps prevent repeated action?", 2, four(
      choice("Increase the number of event subscriptions", "More subscriptions can increase duplicate triggers."),
      choice("Disable all audit logging", "Auditing is needed to understand automation."),
      choice("Deduplication/idempotency keys and a cooldown or state check", "These controls prevent repeated remediation for one event."),
      choice("Remove authorization checks", "Removing authorization increases risk.")
    )),
    single("event-driven-automation", 3, "Why should an automation rule validate the event source and payload before a change?", 1, four(
      choice("Event payloads are always cryptographically trusted by default", "Trust depends on the event transport and source authentication."),
      choice("Malformed or spoofed events could otherwise trigger unsafe actions", "Validation and source checks protect automation triggers."),
      choice("Validation converts events to routing protocols", "Validation does not change protocol role."),
      choice("Payload checking prevents every network fault", "It reduces automation risk but does not prevent all outages.")
    )),
    single("event-driven-automation", 4, "A remediation action changes routing after a single interface alarm, but the alarm clears immediately. What operational safeguard helps avoid oscillation?", 3, four(
      choice("Run the remediation continuously with no delay", "Continuous actions can amplify flapping."),
      choice("Remove all event telemetry", "Removing observability conceals future faults."),
      choice("Use an unbounded retry loop", "Unbounded retries can worsen instability."),
      choice("Require persistence/threshold conditions and verify recovery before acting again", "Debounce and post-action state checks reduce oscillation.")
    ))
  ], [
    multi("event-driven-automation", 1, "Which two safeguards should protect event-triggered network changes?", [0, 3], four(
      choice("Authenticate/validate event sources and schema", "Trusted, well-formed events reduce spoofing and parsing risk."),
      choice("Execute every action payload without policy review", "Unvalidated instructions can cause unsafe changes."),
      choice("Suppress logs so sensitive actions are untraceable", "Auditing is required for accountability."),
      choice("Use scoped authorization, idempotent actions, and audit trails", "Controls limit impact and support investigation.")
    )),
    multi("event-driven-automation", 2, "Which two conditions justify human review or a guarded workflow instead of fully automatic remediation?", [1, 2], four(
      choice("A low-risk, well-tested idempotent action with reliable signal", "Such an action may be suitable for automation within policy."),
      choice("An event with ambiguous cause or low confidence", "Uncertain triggers can lead to incorrect remediation."),
      choice("A change with wide blast radius or irreversible impact", "High-impact actions warrant stronger approval."),
      choice("A routinely observed status event with no action attached", "A passive event does not itself require change approval.")
    ))
  ], ordered("event-driven-automation", "Process a network event through guarded automation.", four(
    choice("Execute a scoped, authorized, idempotent response if conditions hold", "Only validated events reach controlled action."),
    choice("Receive and authenticate the event source", "Source trust comes first."),
    choice("Validate payload, deduplicate, and evaluate thresholds/context", "Filtering avoids spoofed and repeated triggers."),
    choice("Record the action and verify resulting network state", "Audit and verification close the loop.")
  ), [1, 2, 0, 3]), simlet("event-driven-automation", "Which two findings justify holding the automated remediation for review?", "event: interface Gi0/1 down\nsource signature: valid\nsame event key received 3 times in 2s\nrule threshold: 10s persistence required\nchange action: withdraw site default route", [1, 3], four(
    choice("The event source signature is invalid", "The signature is reported valid."),
    choice("Repeated notifications share the same event key", "The same key appears three times in two seconds."),
    choice("The event has persisted longer than the configured threshold", "The notification window is only two seconds, below the 10-second requirement."),
    choice("The proposed route withdrawal has meaningful impact and has not passed the persistence gate", "The action affects the site default and the stated threshold is unmet.")
  ))),

  group("catalyst-center-automation", [
    single("catalyst-center-automation", 1, "What is a key operational role of Catalyst Center in a campus automation workflow?", 1, four(
      choice("Forward every endpoint packet through a central data-plane appliance", "Campus forwarding generally remains distributed across network devices."),
      choice("Provide centralized inventory, policy/provisioning, and assurance functions", "The platform coordinates management and automation across campus infrastructure."),
      choice("Replace all campus routing protocols", "Underlying network routing still provides packet forwarding."),
      choice("Assign public IP addresses to every endpoint", "Address services are configured through the network environment.")
    )),
    single("catalyst-center-automation", 2, "A device appears in inventory but cannot be provisioned. Which prerequisite should be checked?", 3, four(
      choice("The dashboard theme color", "Appearance does not establish device support or connectivity."),
      choice("The device's spanning-tree root priority only", "STP priority does not establish platform onboarding."),
      choice("Whether every endpoint uses the same DNS suffix", "Endpoint DNS is not the primary provisioning prerequisite."),
      choice("Device/software compatibility, credentials, reachability, and required licenses/features", "Provisioning depends on supported platform state and management connectivity.")
    )),
    single("catalyst-center-automation", 3, "Why should a campus automation template be reviewed before deployment to a device group?", 0, four(
      choice("Variables and scope can produce unintended configuration across many devices", "Template rendering and target scope determine change impact."),
      choice("Templates automatically prevent all configuration errors", "Templates can still contain invalid intent or values."),
      choice("Review is unnecessary if the API returns HTTP 200", "Acceptance does not prove correct device state."),
      choice("A template changes only documentation, never live state", "Provisioning templates can modify device configuration.")
    )),
    single("catalyst-center-automation", 4, "An assurance dashboard reports a client issue after a change. What is a sound next step?", 2, four(
      choice("Assume the dashboard automatically fixed the issue", "Assurance surfaces evidence; it does not guarantee remediation."),
      choice("Clear all telemetry before investigating", "Clearing evidence removes useful incident context."),
      choice("Correlate client, device, path, and change evidence, then verify the affected service", "Assurance data should guide evidence-based troubleshooting and validation."),
      choice("Reprovision every site immediately", "A broad rollout risks expanding the incident.")
    ))
  ], [
    multi("catalyst-center-automation", 1, "Which two practices support safe centralized campus provisioning?", [0, 2], four(
      choice("Pilot a supported device group and inspect rendered configuration", "A pilot and preview catch template/support issues before expansion."),
      choice("Apply every template to all sites without checking inventory", "Unscoped provisioning can create a large blast radius."),
      choice("Validate device compatibility and credentials before the change", "Supported software and management access are prerequisites."),
      choice("Treat inventory discovery as proof of policy compliance", "Discovery does not prove configuration intent is met.")
    )),
    multi("catalyst-center-automation", 2, "Which two data sources help investigate a campus assurance alert?", [1, 3], four(
      choice("Only a screenshot of the dashboard", "A screenshot omits the underlying path and device evidence."),
      choice("Client onboarding/health details and affected network device state", "Client and infrastructure evidence narrow the fault."),
      choice("The network operator's unrelated browser history", "It does not establish network behavior."),
      choice("Recent change records and path/telemetry data for the affected service", "Correlating changes with path evidence can identify the service fault.")
    ))
  ], ordered("catalyst-center-automation", "Use centralized campus automation with staged validation.", four(
    choice("Verify device state and assurance after deployment", "Post-deployment evidence confirms outcome."),
    choice("Discover supported devices and establish secure management access", "Inventory and credentials are prerequisites."),
    choice("Prepare intent/template variables and review the rendered change", "Review reveals target-specific configuration."),
    choice("Pilot provisioning, inspect results, then expand by approved scope", "A staged rollout limits blast radius.")
  ), [1, 2, 3, 0]), simlet("catalyst-center-automation", "Which two conclusions follow from this illustrative provisioning summary?", "inventory: SW-21 reachable, supported\nsite assignment: Building-B\ntemplate preview: VLAN 220 on Gi1/0/8\nprovisioning result: failed; credential privilege insufficient\nassurance: client on Gi1/0/8 remains in VLAN 20", [0, 2], four(
    choice("The device is reachable and listed as supported", "Inventory reports reachable and supported."),
    choice("The template was successfully applied", "Provisioning failed because privilege was insufficient."),
    choice("Insufficient credentials prevented the VLAN 220 change", "The result explicitly reports privilege insufficiency."),
    choice("Assurance confirms the client moved to VLAN 220", "The client remains in VLAN 20.")
  )))
];

export const encorQuestions: AssessmentQuestion[] = groups.flatMap((entry) => [
  ...entry.singles,
  ...entry.multi,
  entry.ordering,
  entry.simlet
]);
