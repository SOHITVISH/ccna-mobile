import type { AssessmentOption, AssessmentQuestion } from "../assessmentTypes";

type Choice = Pick<AssessmentOption, "text" | "explanation">;
type Quad<T> = [T, T, T, T];
type Index = 0 | 1 | 2 | 3;
type Pair = [Index, Index];

const quad = <T,>(a: T, b: T, c: T, d: T): Quad<T> => [a, b, c, d];
const c = (text: string, explanation: string): Choice => ({ text, explanation });

function options(id: string, choices: Quad<Choice>): Quad<AssessmentOption> {
  return quad(
    { id: `${id}-a`, ...choices[0] },
    { id: `${id}-b`, ...choices[1] },
    { id: `${id}-c`, ...choices[2] },
    { id: `${id}-d`, ...choices[3] }
  );
}

function optionId(choices: Quad<AssessmentOption>, index: Index): string {
  switch (index) {
    case 0: return choices[0].id;
    case 1: return choices[1].id;
    case 2: return choices[2].id;
    case 3: return choices[3].id;
  }
}

function single(topicId: string, number: number, prompt: string, answer: Index, choices: Quad<Choice>): AssessmentQuestion {
  const id = `${topicId}-single-${number}`;
  const result = options(id, choices);
  return { id, topicId, type: "single", prompt, options: result, answerIds: [optionId(result, answer)] };
}

function multi(topicId: string, number: number, prompt: string, answers: Pair, choices: Quad<Choice>): AssessmentQuestion {
  const id = `${topicId}-multi-${number}`;
  const result = options(id, choices);
  return {
    id, topicId, type: "multi-select", prompt, options: result,
    answerIds: [optionId(result, answers[0]), optionId(result, answers[1])]
  };
}

function ordering(topicId: string, prompt: string, choices: Quad<Choice>, sequence: Quad<Index>): AssessmentQuestion {
  const id = `${topicId}-ordering`;
  const result = options(id, choices);
  return {
    id, topicId, type: "ordering", prompt, items: result,
    correctOrder: quad(
      optionId(result, sequence[0]), optionId(result, sequence[1]),
      optionId(result, sequence[2]), optionId(result, sequence[3])
    )
  };
}

function simlet(topicId: string, prompt: string, output: string, answers: Pair, choices: Quad<Choice>): AssessmentQuestion {
  const id = `${topicId}-simlet`;
  const result = options(id, choices);
  return {
    id, topicId, type: "simlet", prompt, output, options: result,
    answerIds: [optionId(result, answers[0]), optionId(result, answers[1])]
  };
}

const topics: AssessmentQuestion[] = [
  // Advanced Layer 3
  single("ospf-multi-area", 1, "A route in area 20 must be summarized before it is advertised into area 0. Which router and configuration context can perform that inter-area summarization?", 0, quad(
    c("An ABR using an area range", "An ABR summarizes prefixes from a nonbackbone area toward the backbone."),
    c("An ASBR using an area range", "ASBR external summaries use different controls; this is inter-area aggregation."),
    c("An internal router changing its router ID", "Router IDs identify routers but do not aggregate area routes."),
    c("A DR setting a network mask", "DR election is a link function, not an inter-area summary mechanism.")
  )),
  single("ospf-multi-area", 2, "An OSPF design has area 12 connected to area 0 only through another nonbackbone area. What fundamental design issue does this create?", 0, quad(
    c("Area 12 lacks a valid connection to the backbone", "OSPF inter-area exchange is designed around area 0 connectivity."),
    c("Area 12 elects too many DRs", "DR elections do not repair a missing backbone path."),
    c("The area must use a different process ID", "Process IDs are locally significant and do not establish backbone connectivity."),
    c("The routers need identical interface costs", "Cost matching is not a substitute for the required area topology.")
  )),
  single("ospf-multi-area", 3, "Two OSPF routers on a point-to-point link remain in EXSTART. Which mismatch is a high-value first check?", 2, quad(
    c("The remote router's default route", "Default reachability does not determine neighbor database exchange on the link."),
    c("The configured BGP local preference", "BGP policy has no effect on OSPF adjacency formation."),
    c("MTU values on the adjacent interfaces", "An MTU mismatch can prevent database description packets from progressing."),
    c("The area range on a distant ABR", "A remote summary setting does not normally block this adjacency state.")
  )),
  single("ospf-multi-area", 4, "A stub area must not receive external Type 5 LSAs but still needs a route toward destinations outside the area. Which design is appropriate?", 3, quad(
    c("Make every router an ASBR", "An ASBR originates external information rather than suppressing it."),
    c("Convert the area to a point-to-point network", "Network type does not provide stub-area external filtering."),
    c("Filter all Type 3 LSAs at the ABR", "That also removes inter-area reachability rather than adding a default."),
    c("Configure the area as stub and use the ABR-originated default", "A stub area suppresses Type 5 LSAs and receives a default from its ABR.")
  )),
  multi("ospf-multi-area", 1, "Which two statements correctly describe OSPF area design?", [0, 2], quad(
    c("An ABR connects area 0 to one or more other areas", "Area-boundary routers exchange inter-area information across areas."),
    c("An ASBR must always be the ABR", "ASBR and ABR roles can be held by different routers."),
    c("An area range can aggregate routes at an ABR", "Area ranges summarize prefixes at an area boundary."),
    c("An area ID must be globally unique across the enterprise", "Area IDs need to match within an area, not be globally unique.")
  )),
  multi("ospf-multi-area", 2, "An engineer wants to reduce inter-area routing churn without hiding needed reachability. Which two actions are appropriate?", [1, 3], quad(
    c("Set every link cost to zero", "Zeroing costs distorts path selection and does not aggregate route changes."),
    c("Summarize stable contiguous prefixes at an ABR", "A suitable summary can conceal changes to component routes."),
    c("Place unrelated address blocks under one broad summary", "A summary can falsely imply reachability to holes in its range."),
    c("Validate component reachability and summary behavior before deployment", "Testing prevents a summary from black-holing destinations.")
  )),
  ordering("ospf-multi-area", "Arrange a safe OSPF multi-area change from initial assessment to verification.", quad(
    c("Confirm adjacencies, LSDB, and intended inter-area routes", "Operational checks confirm the change achieved the intended state."),
    c("Map area membership, backbone links, and prefix ownership", "Topology and address ownership establish the design constraints."),
    c("Configure the ABR area boundary and any justified range", "Apply the boundary and aggregation after validating the design."),
    c("Check that summaries do not conceal unreachable component prefixes", "Reachability validation should follow configuration.")
  ), quad(1, 2, 3, 0)),
  simlet("ospf-multi-area", "A branch area loses one internal prefix after a proposed summary change. Which two observations best explain the likely issue?", [
    "ABR-1# show ip ospf database summary\n10.40.0.0/16  adv-router 1.1.1.1\nABR-1# show ip route 10.40.8.0\n% Network not in table\nCore# show ip route 10.40.0.0\nO IA 10.40.0.0/16 via 192.0.2.1"
  ].join("\n"), [0, 2], quad(
    c("The /16 summary is advertised although the component /24 is absent", "The core may forward toward a summary whose specific destination is unavailable."),
    c("The core has no inter-area route at all", "The output explicitly shows the core has an O IA summary route."),
    c("The ABR has no route for the missing component prefix", "The ABR's route lookup confirms that component 10.40.8.0 is absent."),
    c("The OSPF process IDs differ between all routers", "The shown inter-area route indicates OSPF information is being exchanged.")
  )),

  single("ospf-lsa-filtering", 1, "A Type 3 LSA is present in the area 0 LSDB, but a downstream router does not install the corresponding inter-area prefix. Which control most directly governs that route installation?", 1, quad(
    c("The DR priority on the receiving LAN", "DR priority affects adjacency roles, not inter-area route filtering."),
    c("An ABR inter-area prefix filter such as a prefix-list policy", "An ABR can filter inter-area prefixes as they are advertised to another area."),
    c("The external route metric type", "Metric type applies to external routes, not a Type 3 inter-area route."),
    c("The receiver's interface bandwidth statement", "Bandwidth-derived cost can affect preference, not prefix filtering.")
  )),
  single("ospf-lsa-filtering", 2, "Which LSA type normally describes an external destination redistributed into OSPF?", 2, quad(
    c("Type 1 router LSA", "Type 1 describes a router's links within its area."),
    c("Type 2 network LSA", "Type 2 describes a transit network originated by its DR."),
    c("Type 5 AS-external LSA", "Type 5 carries external reachability throughout eligible OSPF areas."),
    c("Type 3 summary LSA", "Type 3 carries inter-area prefixes originated by an ABR.")
  )),
  single("ospf-lsa-filtering", 3, "An ABR must prevent selected inter-area prefixes from entering a target area while keeping other Type 3 routes. Which approach is most appropriate?", 0, quad(
    c("Apply a supported prefix filter at the ABR for that area", "An ABR prefix filter can selectively control inter-area advertisements."),
    c("Change the target area's router IDs", "Router IDs do not selectively suppress Type 3 prefixes."),
    c("Raise the DR priority on every router", "DR election does not control inter-area advertisement policy."),
    c("Disable all OSPF neighbor relationships in the target area", "Removing adjacencies removes the entire area's OSPF connectivity.")
  )),
  single("ospf-lsa-filtering", 4, "A Type 7 external LSA appears inside an NSSA. Which router normally translates it into a Type 5 LSA for other eligible areas?", 3, quad(
    c("The NSSA's designated router", "The DR originates network LSAs, not NSSA external translations."),
    c("Any internal router with a default route", "A default route does not grant LSA translation behavior."),
    c("The area 0 DR only", "The backbone DR does not perform this translation role."),
    c("An NSSA ABR selected for Type 7 translation", "An NSSA ABR translates eligible Type 7 information into Type 5.")
  )),
  multi("ospf-lsa-filtering", 1, "Which two statements about OSPF LSA scope and purpose are correct?", [0, 3], quad(
    c("Type 1 LSAs describe router links within an area", "Router LSAs are area-scoped topology information."),
    c("Type 3 LSAs describe external routes from an ASBR", "Type 3 describes inter-area summaries; external routes use Type 5 or 7."),
    c("Type 2 LSAs are originated by every ABR", "The DR on a multiaccess network originates Type 2."),
    c("Type 5 LSAs carry AS-external reachability", "Type 5 is the standard external LSA for non-NSSA areas.")
  )),
  multi("ospf-lsa-filtering", 2, "Before suppressing OSPF information, which two checks reduce the risk of unintended reachability loss?", [1, 2], quad(
    c("Assume that a filtered route will be replaced automatically by a default", "A default may not exist or may not reach the destination."),
    c("Identify whether the route is intra-area, inter-area, or external", "LSA class and route scope determine which filtering method applies."),
    c("Inspect LSDB and routing-table effects in each affected area", "The LSDB and RIB reveal propagation and installation consequences."),
    c("Apply the same filter to all areas without a rollback", "Blanket changes can suppress required routes and complicate recovery.")
  )),
  ordering("ospf-lsa-filtering", "Arrange a controlled OSPF route-filtering change.", quad(
    c("Verify the LSAs and installed routes at affected boundaries", "Post-change verification checks both control and forwarding state."),
    c("Identify the LSA class and the area boundary involved", "Correctly classifying the information is the first step."),
    c("Build a narrow filter for only the intended prefixes", "A specific policy minimizes collateral suppression."),
    c("Test reachability and rollback behavior before broad deployment", "Controlled testing validates impact and recovery.")
  ), quad(1, 2, 3, 0)),
  simlet("ospf-lsa-filtering", "A route was expected in area 30 but the ABR filter is suspect. Which two conclusions follow from the output?", [
    "ABR# show ip ospf database summary\n10.30.4.0/24 adv-router 1.1.1.1\nABR# show ip prefix-list TO-30\n seq 5 deny 10.30.0.0/16 le 24\n seq 20 permit 0.0.0.0/0 le 32\nR30# show ip route 10.30.4.0\n% Network not in table"
  ].join("\n"), [1, 3], quad(
    c("The ABR has no summary LSA for any 10.30 prefix", "The database output shows a matching summary LSA."),
    c("The /24 falls within the prefix-list's denied /16 range", "The deny matches 10.30.4.0/24 because it is within 10.30.0.0/16 and length 24."),
    c("The receiving router has installed the prefix successfully", "Its route lookup reports no matching route."),
    c("The following permit does not override an earlier matching deny", "Prefix-list processing stops at the first matching sequence.")
  )),

  single("eigrp-advanced", 1, "An EIGRP feasible successor must satisfy which condition relative to the current successor's feasible distance?", 0, quad(
    c("Its reported distance is less than the current feasible distance", "The strict feasibility condition guarantees a loop-free backup path."),
    c("Its reported distance is greater than the successor's reported distance", "That comparison alone does not satisfy feasibility."),
    c("Its administrative distance is exactly 90", "Administrative distance is not the feasibility test."),
    c("Its metric equals the successor metric", "An equal route is not automatically a feasible successor.")
  )),
  single("eigrp-advanced", 2, "A router has one successor and a second unequal-cost path that satisfies the feasibility condition. What additional setting permits eligible unequal-cost load sharing?", 2, quad(
    c("Passive-interface", "Passive-interface controls neighbor formation, not unequal-cost installation."),
    c("Variance set to zero", "A zero variance permits only equal-cost paths."),
    c("A suitable EIGRP variance value", "Variance allows qualifying feasible paths within the configured metric multiple."),
    c("A larger router ID", "Router ID does not enable unequal-cost multipathing.")
  )),
  single("eigrp-advanced", 3, "Two EIGRP neighbors on the same link do not form an adjacency. Which parameter should be checked for consistency first?", 1, quad(
    c("The peer's BGP weight", "BGP attributes do not affect EIGRP neighbor formation."),
    c("The EIGRP autonomous-system number", "Neighbors must participate in the same EIGRP AS."),
    c("The peer's OSPF area ID", "OSPF area membership is unrelated to EIGRP adjacency."),
    c("The VLAN's HSRP priority", "FHRP priority does not establish EIGRP neighbors.")
  )),
  single("eigrp-advanced", 4, "In EIGRP named mode, where are address-family-specific interface and topology settings organized?", 3, quad(
    c("Under a global BGP address-family hierarchy", "BGP configuration hierarchy is separate from EIGRP named mode."),
    c("Only under each interface's OSPF process", "OSPF interface settings do not configure EIGRP."),
    c("In the routing table as route tags", "Route tags annotate routes; they are not the named-mode configuration hierarchy."),
    c("Within the named EIGRP instance's address-family and topology hierarchy", "Named mode organizes EIGRP settings by instance, address family, and topology.")
  )),
  multi("eigrp-advanced", 1, "Which two properties are required for a backup route to qualify as a feasible successor?", [0, 2], quad(
    c("It is a learned alternate path with reported distance below feasible distance", "This satisfies EIGRP's loop-free feasibility condition."),
    c("It has a lower administrative distance than every static route", "Administrative distance does not determine feasible-successor status."),
    c("It is loop-free under the feasibility condition", "The condition is designed to ensure a safe backup."),
    c("It must have exactly the successor's composite metric", "A feasible successor can have a different metric.")
  )),
  multi("eigrp-advanced", 2, "A variance change is being considered. Which two practices are appropriate?", [1, 3], quad(
    c("Set an arbitrarily large variance to include every route", "Unbounded path inclusion can create unwanted traffic distribution."),
    c("Confirm alternate paths meet feasibility requirements", "Variance does not waive the loop-free feasibility condition."),
    c("Ignore interface delay because only bandwidth is used", "EIGRP's composite metric can include both bandwidth and delay."),
    c("Validate path capacity and actual traffic sharing", "Eligible routes may differ in capacity and traffic may not balance evenly.")
  )),
  ordering("eigrp-advanced", "Put EIGRP unequal-cost path validation in a safe order.", quad(
    c("Monitor installed paths and traffic distribution after the change", "Monitoring verifies the actual forwarding result."),
    c("Inspect successor, feasible distance, and alternate reported distances", "Metric evidence identifies potential qualifying backups."),
    c("Confirm alternate routes meet the feasibility condition", "Loop-free eligibility must be established before adding paths."),
    c("Apply a justified variance and retest reachability", "Configure the bounded variance only after validating candidates.")
  ), quad(1, 2, 3, 0)),
  simlet("eigrp-advanced", "Which two conclusions are supported by this EIGRP topology output?", [
    "R1# show ip eigrp topology 10.8.0.0/16\nP 10.8.0.0/16, 1 successors, FD is 12000\n via 192.0.2.2 (12000/9000), Gi0/0\n via 192.0.2.6 (18000/10000), Gi0/1\nR1# show ip protocols\nEIGRP variance 2"
  ].join("\n"), [0, 2], quad(
    c("The second path's RD 10000 is below FD 12000", "That strict comparison satisfies the feasibility condition."),
    c("The second path is not feasible because its total metric is higher", "Feasibility compares reported distance with feasible distance, not total metric alone."),
    c("Variance 2 can admit the alternate metric if other eligibility checks pass", "18000 is within twice the successor metric 12000, subject to feasibility."),
    c("The displayed output proves packets are evenly load-shared", "Topology data does not demonstrate actual traffic distribution.")
  )),

  single("bgp-path-policy", 1, "A route received from one eBGP neighbor should be preferred over competing routes inside the local AS without changing its advertised path length. Which attribute is commonly adjusted?", 0, quad(
    c("Local preference", "Higher local preference selects the preferred exit throughout the AS and is not sent to eBGP peers."),
    c("MED", "MED is an inter-AS hint and is not the usual internal-AS-wide preference control."),
    c("Origin code", "Changing origin does not express this local exit preference."),
    c("AS-path prepend on the incoming route", "Prepending an inbound path is not a normal local selection control.")
  )),
  single("bgp-path-policy", 2, "A BGP route learned from one external peer must be sent to another external peer. Which default behavior applies?", 3, quad(
    c("It is advertised only if the next hop is directly connected", "Next-hop reachability affects usability, not this general export rule."),
    c("It is never advertised to any peer", "The restriction applies to iBGP-learned routes, not all eBGP-learned routes."),
    c("It is advertised only after changing the origin code", "Origin modification is not required for ordinary eBGP propagation."),
    c("It may be advertised, subject to outbound policy and loop prevention", "eBGP-learned routes can be propagated to other eBGP peers under policy.")
  )),
  single("bgp-path-policy", 3, "A route learned through iBGP is not being advertised to another iBGP neighbor. Which rule most likely explains this?", 1, quad(
    c("BGP always suppresses routes learned from eBGP", "eBGP-learned routes are normally eligible for propagation to iBGP."),
    c("The iBGP split-horizon rule prevents re-advertising it to another iBGP peer", "Without a full mesh or route reflector, iBGP-learned routes are not re-advertised."),
    c("The route has an OSPF metric", "An OSPF metric does not directly create the iBGP propagation restriction."),
    c("The router has an IPv6 neighbor", "Address family presence does not determine this IPv4 iBGP rule.")
  )),
  single("bgp-path-policy", 4, "An organization wants to influence an adjacent AS's choice among multiple exit points for its prefixes. Which attribute is designed as an external hint?", 2, quad(
    c("Local preference", "Local preference is an internal-AS decision and is not propagated to eBGP."),
    c("Weight", "Weight is vendor-local and is not advertised to peers."),
    c("MED", "MED can suggest a preferred ingress point to a neighboring AS, subject to its policy."),
    c("Router ID", "Router ID is an identifier, not an inter-AS path preference hint.")
  )),
  multi("bgp-path-policy", 1, "Which two statements correctly distinguish BGP local preference and weight?", [0, 3], quad(
    c("Local preference is shared within an AS through iBGP", "It communicates the AS's preferred exit to internal BGP speakers."),
    c("Weight is a standardized attribute advertised to all peers", "Weight is implementation-local and is not transmitted."),
    c("Local preference is normally sent to external peers", "It is generally not propagated across eBGP."),
    c("Weight affects only the local router's path choice", "A local-only value cannot directly coordinate remote routers.")
  )),
  multi("bgp-path-policy", 2, "A BGP policy should reject customer-learned default routes and protect against accidental transit. Which two controls help?", [1, 2], quad(
    c("Set every received route's local preference to the maximum", "This increases preference rather than rejecting unauthorized routes."),
    c("Apply an explicit inbound prefix policy for allowed routes", "A narrow inbound allow-list rejects unapproved announcements."),
    c("Apply a deliberate outbound policy to each peer", "Export policy prevents unintended route propagation or transit."),
    c("Disable next-hop reachability checks", "Unresolvable next hops can make routes unusable and are not a policy control.")
  )),
  ordering("bgp-path-policy", "Arrange a BGP policy rollout to prefer a designated exit safely.", quad(
    c("Verify selected path, advertised routes, and reachability", "Check both local selection and external policy effects."),
    c("Inventory peers, prefixes, and intended import/export behavior", "Policy requirements must be clear before configuration."),
    c("Apply a scoped attribute or prefix policy to the intended peer", "Implement only the documented change."),
    c("Test failover and confirm no unintended transit", "Failure and export tests reveal policy side effects.")
  ), quad(1, 2, 3, 0)),
  simlet("bgp-path-policy", "A network expects local preference 200 to select the left exit. Which two statements are supported by this output?", [
    "R1# show bgp ipv4 unicast 203.0.113.0/24\n*> 198.51.100.1  localpref 100, AS path 64520\n*  198.51.100.5  localpref 200, AS path 64530\nR1# show bgp ipv4 unicast neighbors 198.51.100.5 advertised-routes\n203.0.113.0/24"
  ].join("\n"), [1, 3], quad(
    c("The route via 198.51.100.1 wins because its local preference is lower", "Higher local preference is preferred when other factors are comparable."),
    c("The route via 198.51.100.5 is preferred on local preference", "Its value 200 exceeds the competing path's 100."),
    c("Local preference 200 is advertised to the eBGP neighbor", "Local preference is not normally propagated across eBGP."),
    c("The route is being advertised to neighbor 198.51.100.5", "The advertised-routes output lists the prefix for that neighbor.")
  )),

  single("route-redistribution", 1, "When redistributing routes from OSPF into EIGRP, which attribute is essential to avoid assigning an unusable default metric?", 2, quad(
    c("An OSPF area range", "Area ranges aggregate OSPF prefixes; they do not set EIGRP's redistributed metric."),
    c("An EIGRP router ID matching the OSPF router ID", "Router-ID equality is not required for redistribution."),
    c("A valid EIGRP seed metric or default metric", "EIGRP needs its metric components for externally injected routes."),
    c("A BGP MED value", "MED is not the EIGRP composite metric.")
  )),
  single("route-redistribution", 2, "Two routing protocols mutually redistribute the same routes at two routers. Which measure most directly helps prevent routes from circulating back?", 0, quad(
    c("Tag redistributed routes and deny the tag on re-entry", "Route tags can identify and block a route at its redistribution boundary."),
    c("Set both protocols to the same process number", "Protocol process identifiers do not prevent redistribution feedback."),
    c("Disable all route metrics", "Metrics are required for selection and do not identify route origin safely."),
    c("Use a host route for every destination", "More-specific routes do not solve feedback loops.")
  )),
  single("route-redistribution", 3, "A connected subnet should enter OSPF only when its interface is operational, without redistributing every connected interface. What is the most targeted approach?", 3, quad(
    c("Redistribute all connected routes without a filter", "This imports unrelated connected networks as well."),
    c("Originate a default route from every router", "A default does not selectively inject the connected subnet."),
    c("Raise the OSPF reference bandwidth", "Reference bandwidth changes cost calculations, not route source filtering."),
    c("Redistribute connected routes with a narrow route-map match", "A route-map can restrict redistribution to the intended network.")
  )),
  single("route-redistribution", 4, "A route is present in the source protocol but absent in the receiving protocol after redistribution. Which configuration dependency should be checked early?", 1, quad(
    c("The receiving interface's duplex", "Duplex affects link operation, not redistribution metric configuration."),
    c("The destination protocol's required metric and route-map match", "A missing seed metric or failed policy match commonly prevents injection."),
    c("The source protocol's router ID formatting", "Router ID syntax does not establish redistribution eligibility."),
    c("The spanning-tree root bridge", "Layer 2 root election does not control route redistribution.")
  )),
  multi("route-redistribution", 1, "Which two safeguards are valuable when configuring mutual redistribution?", [0, 2], quad(
    c("Use route tags or distinct policy markers to prevent re-entry", "Markers provide a policy signal to stop feedback."),
    c("Permit all routes in both directions with no metrics", "Unfiltered mutual redistribution can create loops and unusable routes."),
    c("Define explicit prefix scope and metrics at each boundary", "Scoped policy and valid metrics control reachability and preference."),
    c("Assume administrative distance alone prevents feedback", "Distance selects among routes locally but does not stop a route being reintroduced.")
  )),
  multi("route-redistribution", 2, "When diagnosing a missing redistributed route, which two checks are most relevant?", [1, 3], quad(
    c("The client application's DNS suffix only", "Name resolution does not explain routing-protocol injection."),
    c("Whether the route-map matches the source prefix or tag", "A policy mismatch can deny the route."),
    c("Whether both protocols use the same hello timer", "Hello timers govern neighbor behavior, not redistribution matching."),
    c("Whether the target protocol has a valid seed metric", "Some protocols require metric values for external routes.")
  )),
  ordering("route-redistribution", "Put a controlled route-redistribution change in order.", quad(
    c("Verify the route appears with the intended source, metric, and tag", "Route attributes confirm correct injection."),
    c("Identify source routes, target protocol, and permitted prefixes", "Scope and direction must be determined first."),
    c("Configure metric and filtering/loop-prevention policy", "Apply required attributes and guardrails at the boundary."),
    c("Test return paths and ensure routes cannot feed back", "End-to-end and feedback checks validate the policy.")
  ), quad(1, 2, 3, 0)),
  simlet("route-redistribution", "A prefix should move from OSPF into EIGRP. Which two explanations fit this output?", [
    "R2# show ip route 10.70.8.0\nO 10.70.8.0/24 via 192.0.2.1\nR2# show route-map OSPF-TO-EIGRP\n permit 10\n  match tag 77\nR2# show ip eigrp topology 10.70.8.0/24\n% Not in topology table"
  ].join("\n"), [0, 2], quad(
    c("The OSPF route exists at the redistribution point", "The routing table shows an OSPF route for the target prefix."),
    c("The EIGRP topology confirms the route was injected", "The topology lookup says the prefix is absent."),
    c("The route-map requires tag 77, which may not match this route", "No tag is shown on the OSPF route, so the match may fail."),
    c("The OSPF route is automatically redistributed into EIGRP", "Redistribution requires explicit configuration and a matching policy.")
  )),

  single("route-maps-prefix-policy", 1, "A prefix list must match exactly 10.8.0.0/16 and no more-specific routes. Which prefix-list form expresses that?", 3, quad(
    c("permit 10.8.0.0/16 le 32", "The le bound permits more-specific masks through /32."),
    c("permit 10.8.0.0/16 ge 16", "This also permits longer prefixes unless an upper bound is added."),
    c("permit 10.8.0.0/16 le 16 ge 24", "The lower bound conflicts with exact /16 matching."),
    c("permit 10.8.0.0/16", "Without ge/le modifiers, the prefix and mask length must match exactly.")
  )),
  single("route-maps-prefix-policy", 2, "A route-map has two permit sequences. A route matches sequence 10. What happens next?", 1, quad(
    c("All later sequences are also evaluated and their actions combined", "Route-map processing does not combine every matching sequence."),
    c("Processing stops at the first matching sequence", "The first matching route-map sequence determines the action."),
    c("The route is denied unless sequence 20 also matches", "A permit sequence can accept the route without a later match."),
    c("The route is compared against the prefix-list sequence numbers instead", "Prefix-list sequence order is separate from route-map processing.")
  )),
  single("route-maps-prefix-policy", 3, "Which community-list setting allows a BGP route-map match to succeed when a route carries the specified community plus additional communities?", 0, quad(
    c("Use a non-exact community match", "A non-exact match can find the target community among additional values."),
    c("Require an empty community attribute", "An empty attribute cannot contain the requested community."),
    c("Match only the route's next-hop MAC address", "A MAC address is not a BGP community."),
    c("Disable community propagation on all peers", "Suppressing propagation prevents remote policy from seeing communities.")
  )),
  single("route-maps-prefix-policy", 4, "A prefix-list has no matching permit entry for an advertised route. What is the result when it is used as a route filter?", 2, quad(
    c("The route is implicitly permitted", "Prefix lists have an implicit deny at the end."),
    c("The route inherits the previous route's action", "Each route is evaluated independently."),
    c("The route is denied by the implicit final deny", "A prefix-list with no matching permit rejects the route."),
    c("The route is converted to a default", "Filtering does not rewrite an unmatched prefix to a default.")
  )),
  multi("route-maps-prefix-policy", 1, "Which two statements about prefix-list matching are correct?", [0, 3], quad(
    c("A bare prefix entry matches its exact prefix length", "No length modifiers means an exact prefix-and-length match."),
    c("A le modifier sets the minimum allowed mask length", "le specifies a maximum length; ge is the lower bound."),
    c("A prefix-list's implicit action is permit", "Unmatched prefixes are denied."),
    c("Sequence numbers are evaluated in ascending order", "The earliest matching sequence controls the result.")
  )),
  multi("route-maps-prefix-policy", 2, "A route-map should set local preference on selected BGP routes. Which two practices are sound?", [1, 2], quad(
    c("Omit all permit sequences so the route-map permits every route", "A route-map with no permit sequence does not safely permit matches."),
    c("Use explicit match criteria for the intended prefixes or communities", "Explicit matches keep the policy scoped."),
    c("Check sequence order and the implicit deny behavior", "A later sequence may never be reached or unmatched routes may be denied."),
    c("Assume a permit sequence automatically matches every route", "A sequence without matching clauses may have broad and unintended effect.")
  )),
  ordering("route-maps-prefix-policy", "Arrange creation and verification of a prefix-based routing policy.", quad(
    c("Inspect route-map counters and resulting advertisements", "Counters and output confirm the policy's effect."),
    c("List exact prefixes and permitted mask-length ranges", "The desired match boundaries must be explicit."),
    c("Build and test the prefix-list entries", "Create the matching predicate before referencing it."),
    c("Attach the route-map in the intended direction and validate", "Apply the policy to the correct control-plane boundary.")
  ), quad(1, 2, 3, 0)),
  simlet("route-maps-prefix-policy", "A policy should accept 10.8.0.0/16 and its /24 subnets only. Which two conclusions are correct?", [
    "R1# show ip prefix-list BRANCH\n seq 5 permit 10.8.0.0/16 ge 16 le 24\n seq 10 deny 0.0.0.0/0 le 32\nR1# show ip prefix-list BRANCH 10.8.1.0/24\nseq 5 permit\nR1# show ip prefix-list BRANCH 10.8.1.0/25\nseq 10 deny"
  ].join("\n"), [0, 3], quad(
    c("The prefix-list permits lengths /16 through /24 inside 10.8.0.0/16", "The ge 16 and le 24 modifiers bound matching lengths."),
    c("It also permits 10.8.1.0/25", "The /25 exceeds the maximum length of /24."),
    c("Sequence 10 takes precedence over sequence 5", "Entries are checked in sequence order; 5 is evaluated first."),
    c("The /25 falls through to the explicit deny", "It does not match sequence 5 and matches the catch-all deny.")
  )),

  single("policy-based-routing", 1, "A router applies policy-based routing to traffic arriving on an interface. The route-map's next-hop is unavailable. What should the design explicitly consider?", 0, quad(
    c("Whether the platform should fall back to normal routing", "Many PBR implementations can use the routing table when the policy next hop is unavailable, depending on configuration."),
    c("Whether to disable the destination routing table", "PBR does not require disabling normal route lookup globally."),
    c("Whether the next-hop should become an OSPF area ID", "An OSPF area ID cannot serve as a PBR next hop."),
    c("Whether every interface must use the same policy", "Policies should be attached only where traffic steering is required.")
  )),
  single("policy-based-routing", 2, "Which traffic is typically evaluated by an interface-applied PBR policy?", 2, quad(
    c("Traffic originated by the router itself", "Interface PBR generally applies to packets arriving on the interface, not locally originated traffic."),
    c("Only traffic that has already left the interface", "The policy is evaluated on ingress, before forwarding."),
    c("Transit packets entering the interface", "An inbound interface policy can steer transit packets before normal route selection."),
    c("Only OSPF hello packets", "PBR is not inherently limited to routing-protocol packets.")
  )),
  single("policy-based-routing", 3, "Two PBR route-map sequences match a flow differently. How does the router generally choose which policy action applies?", 1, quad(
    c("The highest sequence number always wins", "Route-map sequences are evaluated in ascending order."),
    c("The first matching route-map sequence determines the action", "Route-map evaluation stops at the first applicable sequence."),
    c("The destination's administrative distance chooses the route-map", "Administrative distance selects routes, not route-map clauses."),
    c("The last interface configured on the router wins", "Configuration order across interfaces does not define route-map matching.")
  )),
  single("policy-based-routing", 4, "An ACL used by a PBR route-map should steer only a voice subnet to a preferred WAN next hop. Which design is safest?", 3, quad(
    c("Match all traffic and redirect it to the voice gateway", "Broad matching also diverts unrelated applications."),
    c("Deny the voice subnet in the ACL and expect that to select a next hop", "An ACL deny is not a PBR next-hop action."),
    c("Use a default route-map action for every unclassified packet", "An unintended catch-all can bypass normal routing."),
    c("Match the source/destination scope precisely and define fallback behavior", "Narrow matching limits impact and explicit fallback avoids black-holing.")
  )),
  multi("policy-based-routing", 1, "Which two operational checks are important before enabling PBR on a production interface?", [0, 2], quad(
    c("Confirm the policy next hop is reachable through a usable path", "An unreachable next hop may cause drops or fallback behavior."),
    c("Remove all normal routes from the routing table", "PBR supplements policy decisions and does not require an empty RIB."),
    c("Test matched and unmatched traffic, including failure behavior", "Both classes and the next-hop loss case must behave as designed."),
    c("Assume locally generated traffic uses the interface policy", "Ordinary interface PBR applies to arriving packets, not generally local traffic.")
  )),
  multi("policy-based-routing", 2, "A PBR policy is unexpectedly bypassed. Which two items should be inspected?", [1, 3], quad(
    c("The BGP origin code of an unrelated prefix", "Origin is not normally a criterion for interface PBR attachment."),
    c("Whether the route-map is attached inbound on the traffic's ingress interface", "Wrong or missing attachment prevents the policy from seeing the traffic."),
    c("The switch's spanning-tree hello time", "STP timers do not determine PBR processing."),
    c("Whether ACL matches and route-map sequence ordering match the packet", "A packet may miss the intended clause or hit an earlier one.")
  )),
  ordering("policy-based-routing", "Arrange a safe PBR deployment for a selected application flow.", quad(
    c("Verify counters, path, and fallback during next-hop loss", "Post-change tests prove the forwarding and recovery behavior."),
    c("Define the exact traffic selector and intended path", "Scope and objective precede implementation."),
    c("Configure the route-map action and explicit fallback", "The policy needs a next hop and a safe nonmatch/unreachable behavior."),
    c("Attach the policy inbound on the correct ingress interface", "Inbound attachment lets the policy process arriving traffic.")
  ), quad(1, 2, 3, 0)),
  simlet("policy-based-routing", "A client flow should use WAN-B but currently follows WAN-A. Which two conclusions follow from these counters?", [
    "R1# show route-map APP-PBR\nroute-map APP-PBR, permit, sequence 10\n match ip address VOICE\n set ip next-hop 192.0.2.9\n Policy routing matches: 0 packets\nR1# show ip interface Gi0/0\n IP policy route-map APP-PBR\nR1# show access-lists VOICE\n permit ip 10.20.0.0/24 any (0 matches)"
  ].join("\n"), [1, 2], quad(
    c("PBR is successfully steering client packets to WAN-B", "Zero matches show that the policy has not steered packets."),
    c("The route-map is attached to Gi0/0", "The interface output confirms the policy attachment."),
    c("The VOICE ACL has not matched traffic in the displayed counter interval", "Its permit counter is zero, suggesting traffic misses the selector or interval."),
    c("The configured next hop is proven reachable", "Configuration and counters do not test next-hop reachability.")
  )),

  single("vrf-route-leaking", 1, "A route must be imported from VRF BLUE into VRF RED while retaining controlled separation. Which configuration model best fits MPLS-style VRF route exchange?", 1, quad(
    c("Copy the global routing table into both VRFs", "This removes isolation and is not selective leaking."),
    c("Use route targets with explicit import/export policy", "Route targets control which VPN routes each VRF exports or imports."),
    c("Change both VRFs to the same RD only", "An RD makes VPN routes unique; it does not itself authorize import."),
    c("Disable route filtering between VRFs", "Unfiltered exchange can expose unintended prefixes.")
  )),
  single("vrf-route-leaking", 2, "Two VRFs use the same IPv4 prefix. What role does a route distinguisher serve in a VPN routing architecture?", 0, quad(
    c("Make otherwise overlapping VPN prefixes unique in the VPN address space", "The RD distinguishes routes with identical IPv4 prefixes."),
    c("Authorize the route to be imported by every VRF", "Route-target policy controls import/export membership."),
    c("Encrypt the route between provider edges", "An RD is an identifier, not an encryption mechanism."),
    c("Set the route's forwarding next hop", "The RD does not choose the forwarding next hop.")
  )),
  single("vrf-route-leaking", 3, "A route appears in a VPN control plane but is not imported into VRF BLUE. Which setting most directly governs VRF membership?", 2, quad(
    c("The route's OSPF process ID", "OSPF process IDs do not select VPN import membership."),
    c("The VRF's interface MTU", "MTU does not control importing VPN routes."),
    c("The import route-target policy", "A matching import RT is needed for the VRF to accept that VPN route."),
    c("The provider edge's console line password", "Console authentication does not affect the VPN route table.")
  )),
  single("vrf-route-leaking", 4, "When leaking a shared-services prefix from a services VRF to multiple tenant VRFs, which approach best preserves tenant isolation?", 3, quad(
    c("Import every route target into every tenant", "Broad imports can expose tenant routes to one another."),
    c("Merge all tenants into the global table", "A global table merge abandons VRF separation."),
    c("Use one default route with unrestricted return routing", "An unrestricted return path can bypass intended policy."),
    c("Export only approved service prefixes and import them selectively", "Narrow RT and prefix policy limits visibility to approved services.")
  )),
  multi("vrf-route-leaking", 1, "Which two statements correctly distinguish a route distinguisher from a route target?", [0, 3], quad(
    c("An RD makes overlapping prefixes unique in a VPN routing context", "The RD disambiguates identical customer prefixes."),
    c("An RD alone determines which VRF imports a route", "Import membership is controlled by RTs and policy."),
    c("A route target is a forwarding interface name", "An RT is a BGP extended community, not an interface."),
    c("Route targets express VPN route import/export membership", "RT policy controls which VRFs exchange routes.")
  )),
  multi("vrf-route-leaking", 2, "Before enabling inter-VRF leaking, which two checks protect routing correctness and isolation?", [1, 2], quad(
    c("Allow both VRFs to import every available RT", "A broad import defeats least-privilege route exchange."),
    c("Define the exact source prefixes and destination VRFs", "Explicit scope avoids leaking unrelated routes."),
    c("Check overlapping prefixes, return paths, and policy symmetry", "Overlap and asymmetric policy can cause ambiguous or broken forwarding."),
    c("Treat the RD as an access-control rule", "RD uniqueness does not grant or restrict VRF membership.")
  )),
  ordering("vrf-route-leaking", "Put a selective inter-VRF route leak in a safe sequence.", quad(
    c("Verify the route in each intended VRF and test both directions", "RIB and data-plane testing confirms the leak and return path."),
    c("Identify allowed prefixes, source VRF, destination VRFs, and services", "Documenting scope comes before policy."),
    c("Apply narrow export/import RT and prefix policy", "Configure only the required route exchange."),
    c("Check for overlapping routes and unintended imports", "Isolation checks should precede production activation.")
  ), quad(1, 3, 2, 0)),
  simlet("vrf-route-leaking", "A service prefix should be imported into VRF BLUE. Which two conclusions fit this route-target output?", [
    "PE1# show ip bgp vpnv4 all 10.90.0.0/16\n RD 65000:90\n Route-target community: 65000:90\nPE1# show vrf BLUE detail\n Import RT: 65000:10\n Export RT: 65000:10\nPE1# show ip route vrf BLUE 10.90.0.0\n% Network not in table"
  ].join("\n"), [0, 2], quad(
    c("BLUE's configured import RT does not match the route's shown RT", "BLUE imports 65000:10 while the route carries 65000:90."),
    c("The route distinguisher is the missing import policy", "The RD identifies the VPN route but does not replace RT membership."),
    c("The displayed mismatch explains why BLUE has no route", "The missing route aligns with the unmatched import RT."),
    c("BLUE has already installed the prefix", "Its route lookup reports that the prefix is absent.")
  )),

  single("ipv6-advanced-routing", 1, "An OSPFv3 adjacency does not form over an IPv6 link-local interface. Which addressing fact is essential for IPv6 neighbor communication on that link?", 0, quad(
    c("Both interfaces must have usable link-local addresses on the same link", "OSPFv3 neighbor communication uses IPv6 link-local addresses."),
    c("Both routers must share a global unicast address", "A global unicast address is not required for link-local adjacency."),
    c("The routers must use identical interface identifiers", "Interface identifiers need not match between peers."),
    c("The link-local addresses must be in the same /64 subnet", "Link-local addresses are not configured as a shared global /64 subnet.")
  )),
  single("ipv6-advanced-routing", 2, "A router should forward IPv6 packets between interfaces. Which global control must be enabled?", 2, quad(
    c("IPv4 unicast routing only", "IPv4 forwarding does not enable IPv6 forwarding."),
    c("IPv6 neighbor discovery suppression", "Suppressing ND would impair IPv6 link operation."),
    c("IPv6 unicast routing", "IPv6 forwarding requires IPv6 unicast routing to be enabled."),
    c("An IPv6 default route only", "A route does not turn on forwarding globally.")
  )),
  single("ipv6-advanced-routing", 3, "A site needs a stable IPv6 route to a remote prefix across an OSPFv3 area boundary. Which statement is correct?", 3, quad(
    c("OSPFv3 cannot advertise IPv6 prefixes", "OSPFv3 supports IPv6 routing information."),
    c("Only a Type 5 LSA can carry any IPv6 prefix", "Inter-area IPv6 routes are not limited to external LSAs."),
    c("IPv6 prefixes are carried only in router IDs", "Router IDs identify routers and do not encode prefixes."),
    c("Verify the OSPFv3 address family and relevant inter-area LSAs", "OSPFv3 operation and its LSAs must carry the intended IPv6 reachability.")
  )),
  single("ipv6-advanced-routing", 4, "An IPv6 router receives a packet for a destination outside its connected prefixes. What determines the forwarding next hop?", 1, quad(
    c("The destination's MAC address learned from DNS", "DNS records do not provide the router's IPv6 route decision."),
    c("The most-specific matching IPv6 route and its resolved next hop", "IPv6 forwarding uses longest-prefix matching from the routing table."),
    c("The OSPF process number alone", "A process identifier does not specify a destination path."),
    c("The sender's DHCPv6 transaction ID", "DHCP transaction identifiers are unrelated to route lookup.")
  )),
  multi("ipv6-advanced-routing", 1, "Which two facts are correct about IPv6 link-local addresses in routed networks?", [0, 2], quad(
    c("They are significant only on their local link and are not routed onward", "Link-local scope is limited to a single Layer 2 link."),
    c("They replace the need for a global routing table", "Link-local reachability alone does not provide inter-network routing."),
    c("They commonly serve as next-hop addresses for routing adjacencies", "Routing protocols can use link-local next hops on the connected link."),
    c("They must be unique across the entire Internet", "Their scope is local; global uniqueness is unnecessary.")
  )),
  multi("ipv6-advanced-routing", 2, "A dual-stack routing incident affects only IPv6. Which two checks distinguish it from IPv4 forwarding?", [1, 3], quad(
    c("Check only the IPv4 RIB because IPv6 shares it", "IPv4 and IPv6 maintain separate routing information."),
    c("Inspect IPv6 forwarding enablement and the IPv6 route table", "Both global forwarding and a matching route matter."),
    c("Verify the spanning-tree root's OSPF router ID", "Spanning tree and OSPF router IDs do not establish IPv6 route presence."),
    c("Check IPv6 neighbor discovery and next-hop resolution", "A route can exist while its IPv6 next hop is unresolved.")
  )),
  ordering("ipv6-advanced-routing", "Arrange diagnosis of a missing IPv6 route from local forwarding to protocol evidence.", quad(
    c("Verify the remote router's advertised route and OSPFv3 LSDB", "Protocol evidence locates whether origination or propagation failed."),
    c("Confirm IPv6 forwarding and the destination's longest-prefix route", "Start with local forwarding state."),
    c("Check the interface's link-local and neighbor state", "Link and next-hop health support adjacency and forwarding."),
    c("Trace the next hop and return route across the path", "End-to-end verification reveals further transit or return-path gaps.")
  ), quad(1, 2, 3, 0)),
  simlet("ipv6-advanced-routing", "A router cannot forward to 2001:db8:44::/48. Which two observations point to the cause?", [
    "R3# show ipv6 route 2001:db8:44::/48\n% Route not found\nR3# show ipv6 ospf neighbor\nNeighbor ID 3.3.3.3 State FULL Interface Gi0/1\nR3# show ipv6 interface Gi0/1\nIPv6 is enabled, link-local address FE80::3"
  ].join("\n"), [0, 3], quad(
    c("No IPv6 route to the destination prefix is installed", "The route lookup explicitly reports no matching route."),
    c("IPv6 OSPF adjacency is down", "The neighbor is shown FULL."),
    c("The link-local address proves the remote prefix is reachable", "A local link-local address does not prove a route to a remote prefix."),
    c("The interface has IPv6 enabled and a link-local address", "The interface output confirms local IPv6 activation.")
  )),

  // VPN technologies
  single("ipsec-site-to-site", 1, "IKE peers establish a control channel, but protected data traffic is not encrypted. Which phase-two property should be checked?", 1, quad(
    c("The peers' DNS search domains", "DNS search configuration does not define IPsec traffic protection."),
    c("The negotiated IPsec traffic selectors and transform parameters", "Phase-two policy must agree on protected traffic and cryptographic settings."),
    c("The OSPF DR priority on the transit LAN", "DR election does not negotiate the IPsec data SA."),
    c("The remote peer's SNMP contact string", "SNMP metadata is unrelated to IPsec negotiation.")
  )),
  single("ipsec-site-to-site", 2, "Which statement distinguishes IKE from the IPsec data plane in a site-to-site VPN?", 0, quad(
    c("IKE authenticates peers and negotiates security associations", "IKE establishes keys and policy for protected data traffic."),
    c("IKE encrypts every user packet by itself", "User packets are protected by IPsec SAs, not the IKE control exchange."),
    c("IKE replaces the need for peer authentication", "Peer authentication is one of IKE's core functions."),
    c("IKE assigns client DHCP addresses across the tunnel", "Address assignment is not its site-to-site negotiation role.")
  )),
  single("ipsec-site-to-site", 3, "A site-to-site tunnel is up, but packets from subnet A to subnet B bypass it. Which policy component is a likely cause?", 2, quad(
    c("The NTP stratum on the remote router", "Time source quality does not define which traffic is protected."),
    c("The interface's Ethernet duplex", "Duplex mismatch is not the IPsec traffic selector."),
    c("The crypto ACL or traffic selectors do not include the flow", "Only traffic matching the negotiated selectors enters the protected SA."),
    c("The peer's OSPF router ID is larger", "Router ID ordering does not select IPsec-protected traffic.")
  )),
  single("ipsec-site-to-site", 4, "Why should an engineer verify NAT traversal and permitted UDP ports when an IPsec peer is behind NAT?", 3, quad(
    c("NAT traversal converts IKE into an OSPF adjacency", "NAT-T encapsulates IPsec traffic; it does not create an OSPF neighbor."),
    c("It automatically changes the protected subnets", "NAT-T does not revise traffic selectors."),
    c("It removes the need for IPsec security associations", "SAs remain required for protected data."),
    c("NAT-T commonly encapsulates ESP in UDP so NAT devices can carry it", "UDP/4500 is commonly used for NAT traversal after IKE negotiation.")
  )),
  multi("ipsec-site-to-site", 1, "Which two conditions commonly must align for a policy-based IPsec site-to-site tunnel to pass the intended traffic?", [0, 3], quad(
    c("Compatible peer authentication and cryptographic proposals", "Peers must agree on authentication and security parameters."),
    c("Identical router IDs in both routing domains", "Router IDs need not match and are not IKE proposals."),
    c("Matching switchport access VLAN numbers at both sites", "Local VLAN IDs are not required to match for routed VPN selectors."),
    c("Compatible traffic selectors for the protected subnets", "Both peers must agree on which traffic is protected.")
  )),
  multi("ipsec-site-to-site", 2, "Which two checks are useful when IKE is established but application traffic fails?", [1, 2], quad(
    c("Change the remote peer's hostname until it resolves differently", "Renaming does not fix traffic selectors or data-plane policy."),
    c("Inspect IPsec SA counters and confirm encapsulation/decryption increments", "Counters show whether matching packets enter and exit the SAs."),
    c("Check routing, ACLs, and NAT exemption for protected subnets", "The path and policy around the tunnel can prevent intended traffic."),
    c("Disable authentication on both peers", "Removing authentication is unsafe and does not diagnose data forwarding.")
  )),
  ordering("ipsec-site-to-site", "Arrange a site-to-site IPsec bring-up from prerequisites to protected traffic verification.", quad(
    c("Generate matching traffic and inspect SA counters and return reachability", "Traffic verifies the data plane after negotiation."),
    c("Confirm peer addressing, reachability, and allowed IKE/ESP or NAT-T", "Underlay and permitted transport are prerequisites."),
    c("Align authentication, proposals, and protected traffic selectors", "Both peers must agree on negotiation policy."),
    c("Verify IKE and child/IPsec security associations", "Successful SAs should be confirmed before testing protected traffic.")
  ), quad(1, 2, 3, 0)),
  simlet("ipsec-site-to-site", "A tunnel reports an established IKE SA but no protected packets. Which two conclusions fit the counters?", [
    "GW-A# show crypto ikev2 sa\nPeer 198.51.100.9  State ESTABLISHED\nGW-A# show crypto ipsec sa\nlocal ident: 10.1.0.0/16\nremote ident: 10.2.0.0/16\n#pkts encaps: 0  #pkts decaps: 0\nACL VPN-TRAFFIC permit 10.1.0.0/16 10.20.0.0/16"
  ].join("\n"), [1, 2], quad(
    c("The IKE control association is down", "The output shows IKE state ESTABLISHED."),
    c("The configured traffic ACL's remote range differs from the shown remote selector", "ACL uses 10.20.0.0/16 while the SA selector shows 10.2.0.0/16."),
    c("No protected packets have incremented either IPsec counter", "Both encapsulation and decapsulation counters are zero."),
    c("The output proves application packets are being decrypted", "A zero decapsulation counter does not show received protected traffic.")
  )),

  single("gre-ipsec-overlay", 1, "Why is GRE commonly paired with IPsec when a routed overlay must carry multicast routing traffic?", 0, quad(
    c("GRE can encapsulate multicast and multiple protocol types; IPsec can protect the tunnel", "GRE provides multiprotocol tunneling while IPsec supplies confidentiality and integrity."),
    c("GRE encrypts the payload without security associations", "GRE itself does not provide cryptographic protection."),
    c("IPsec automatically creates a multicast routing adjacency", "IPsec protects traffic but does not replace routing or GRE encapsulation."),
    c("GRE eliminates the need for underlay reachability", "The tunnel endpoints still require a functioning underlay.")
  )),
  single("gre-ipsec-overlay", 2, "A GRE tunnel interface is up/up, but its destination cannot be reached through the physical underlay. What should be fixed first?", 3, quad(
    c("The tunnel's OSPF hello multiplier", "Overlay routing timers cannot restore the missing underlay endpoint path."),
    c("The GRE tunnel's description field", "Interface descriptions do not affect encapsulation reachability."),
    c("The remote overlay's VLAN identifier", "GRE operates across an IP underlay, not a shared overlay VLAN."),
    c("Underlay routing and reachability to the tunnel destination", "GRE encapsulated packets need a route to the remote endpoint outside the tunnel.")
  )),
  single("gre-ipsec-overlay", 3, "A GRE tunnel runs over IPsec. Which traffic must the IPsec policy match to protect the GRE exchange?", 1, quad(
    c("Only the inner application addresses", "The IPsec transport policy must protect the outer GRE endpoint traffic."),
    c("The GRE endpoint addresses and GRE protocol traffic", "IPsec must match the outer GRE packets between tunnel endpoints."),
    c("Only OSPF router IDs", "Router IDs are not packet selectors."),
    c("The Ethernet source MAC addresses across the Internet", "MAC addresses are not carried end-to-end across routed underlays.")
  )),
  single("gre-ipsec-overlay", 4, "An overlay repeatedly forms routing neighbors and then loses them during fragmentation-sensitive transfers. Which interface setting is worth validating?", 2, quad(
    c("The tunnel's administrative distance alone", "Administrative distance affects route selection, not packet fragmentation."),
    c("The underlay's DNS TTL", "DNS TTL does not control tunnel packet size."),
    c("Tunnel MTU and TCP MSS relative to encapsulation overhead", "GRE and IPsec headers reduce effective payload size and can cause fragmentation."),
    c("The remote tunnel's interface description", "A description cannot correct MTU or MSS behavior.")
  )),
  multi("gre-ipsec-overlay", 1, "Which two statements about a GRE-over-IPsec design are correct?", [0, 2], quad(
    c("GRE provides encapsulation; IPsec provides cryptographic protection", "They provide complementary overlay and security functions."),
    c("GRE alone guarantees confidentiality and peer authentication", "GRE is not a cryptographic security protocol."),
    c("The underlay must route between tunnel endpoints", "Tunnel packets depend on endpoint reachability through the underlay."),
    c("The overlay's inner prefixes must be identical at both sites", "Routed sites commonly have distinct inner prefixes.")
  )),
  multi("gre-ipsec-overlay", 2, "Which two checks help diagnose a GRE-over-IPsec tunnel that is up but carries no useful traffic?", [1, 3], quad(
    c("Check whether both peers have the same interface description", "Descriptions have no bearing on encapsulation or selectors."),
    c("Verify underlay reachability to the peer and GRE/IPsec counters", "A tunnel needs endpoint reachability and advancing data counters."),
    c("Change every router ID to match the tunnel source", "Router IDs should be unique where required and do not repair the data path."),
    c("Compare IPsec selectors, routing, and MTU/MSS with the tunnel traffic", "Selector, route, or size mismatch can prevent the payload from passing.")
  )),
  ordering("gre-ipsec-overlay", "Arrange diagnosis of a GRE-over-IPsec overlay with failed application traffic.", quad(
    c("Test overlay routes and application packets after the security association is active", "Final testing validates the user-facing path."),
    c("Confirm endpoint reachability over the underlay", "The outer path is the first dependency."),
    c("Verify GRE interface state and the IPsec selectors protecting GRE", "The overlay and its protection policy must align."),
    c("Check encapsulation counters, MTU, and return routing", "Data-plane evidence and size/route checks localize remaining issues.")
  ), quad(1, 2, 3, 0)),
  simlet("gre-ipsec-overlay", "A GRE-over-IPsec tunnel has no incrementing encapsulation. Which two checks should be prioritized?", [
    "R2# show interface Tunnel10\nTunnel10 is up, line protocol is up\n source 192.0.2.2, destination 198.51.100.2\nR2# show ip route 198.51.100.2\n% Network not in table\nR2# show crypto ipsec sa\n#pkts encaps: 0  #pkts decaps: 0"
  ].join("\n"), [0, 3], quad(
    c("The underlay has no route to the GRE destination", "The route lookup reports no path to 198.51.100.2."),
    c("Tunnel up/up proves remote endpoint reachability", "A logical tunnel state does not prove that the underlay can reach the peer."),
    c("IPsec has successfully carried protected packets", "Both IPsec counters remain at zero."),
    c("Underlay reachability is a prerequisite to useful GRE/IPsec traffic", "The outer tunnel destination must be routable before encapsulated traffic can pass.")
  )),

  single("dmvpn", 1, "In a DMVPN phase 3 design, what does NHRP redirect/shortcut behavior enable after a spoke first sends traffic through the hub?", 2, quad(
    c("Automatic encryption without an IPsec profile", "DMVPN commonly uses IPsec protection separately; NHRP does not encrypt."),
    c("Removal of the hub from all initial registration", "Spokes still register with the NHS/hub."),
    c("A direct spoke-to-spoke forwarding path after resolution", "Phase 3 can let spokes learn and use a more direct path for spoke traffic."),
    c("Conversion of GRE into a point-to-point Ethernet link", "DMVPN remains a multipoint GRE overlay.")
  )),
  single("dmvpn", 2, "What is the role of the NHRP Next Hop Server in a hub-and-spoke DMVPN?", 0, quad(
    c("Resolve overlay network addresses to NBMA addresses and maintain registrations", "The NHS provides NHRP resolution and registration services."),
    c("Select the OSPF designated router on the underlay", "NHRP does not perform OSPF DR election."),
    c("Assign route distinguishers to customer routes", "Route distinguishers are a VPN routing construct, not NHRP."),
    c("Encrypt packets using the NHRP registration key", "NHRP resolution does not provide payload encryption.")
  )),
  single("dmvpn", 3, "A spoke's multipoint GRE interface is up, but it cannot register with the hub's NHS. Which issue is a logical first check?", 3, quad(
    c("The spoke's local DNS search suffix", "NHRP registration normally targets a configured hub address, not a search suffix."),
    c("The LAN access switch's STP portfast setting", "STP edge behavior does not define NHRP registration."),
    c("The hub's BGP local preference", "Local preference does not enable NHRP registration."),
    c("NHRP network ID, NHS mapping, and hub NBMA reachability", "Matching DMVPN parameters and reaching the NHS are necessary for registration.")
  )),
  single("dmvpn", 4, "A DMVPN spoke has a route to another spoke's overlay prefix but traffic is dropped. Which mapping is especially relevant?", 1, quad(
    c("The spoke's DHCP option 66 value", "Boot-server options do not resolve a DMVPN NBMA endpoint."),
    c("NHRP resolution of the remote overlay next hop to its NBMA address", "The overlay next hop must be mapped to an underlay destination."),
    c("The hub's Ethernet MAC address on the remote LAN", "The tunnel traverses routed NBMA transport, not the remote LAN's MAC segment."),
    c("The remote spoke's RADIUS accounting interim interval", "AAA accounting timing does not forward overlay data.")
  )),
  multi("dmvpn", 1, "Which two elements commonly need to be consistent for DMVPN peers to participate in the same overlay?", [0, 3], quad(
    c("The mGRE/NHRP network ID and compatible tunnel addressing", "Overlay parameters must identify the same DMVPN network."),
    c("The spokes' LAN VLAN numbers", "Local access VLAN identifiers need not match across sites."),
    c("The peers' exact hostname strings", "Hostnames do not establish NHRP network membership."),
    c("Compatible IPsec protection and underlay reachability", "Peers must reach one another and agree on the security policy.")
  )),
  multi("dmvpn", 2, "A new spoke has no DMVPN routes. Which two evidence sources should be checked?", [1, 2], quad(
    c("The remote site's printer queue", "Printer status does not expose NHRP or routing adjacency."),
    c("NHRP registration and resolution state", "NHRP state verifies the spoke's overlay mapping and NHS registration."),
    c("Tunnel and routing neighbor state plus route advertisements", "A tunnel alone does not establish overlay route exchange."),
    c("The hub's interface description length", "Description length does not affect DMVPN control traffic.")
  )),
  ordering("dmvpn", "Arrange onboarding and verification of a new DMVPN spoke.", quad(
    c("Verify NHRP registration, routing adjacency, and spoke reachability", "These checks establish the working overlay."),
    c("Confirm the spoke's underlay route to the hub NBMA address", "The spoke first needs an outer path to the hub."),
    c("Configure compatible tunnel, NHRP, and IPsec parameters", "Matching overlay and security settings allow the tunnel to form."),
    c("Advertise approved LAN routes and test return traffic", "Route exchange and bidirectional reachability complete validation.")
  ), quad(1, 2, 3, 0)),
  simlet("dmvpn", "A spoke's tunnel exists but NHRP does not show hub registration. Which two conclusions fit this output?", [
    "Spoke# show dmvpn\nInterface: Tunnel0, Type:Spoke, NHRP Peers: 0\nSpoke# show ip nhrp\n% No entries\nSpoke# show ip route 198.51.100.10\n% Network not in table\nSpoke# show interface Tunnel0\nTunnel0 is up, line protocol is up"
  ].join("\n"), [0, 2], quad(
    c("No underlay route to the hub's NBMA address is shown", "The route lookup reports no path to the hub."),
    c("The tunnel state proves NHRP registration succeeded", "The NHRP outputs explicitly show no peers or entries."),
    c("Tunnel up/up alone does not prove NHS registration", "Overlay interface state and NHRP control-plane state are distinct."),
    c("A DMVPN route to the hub LAN is installed", "No such routing-table entry appears in the output.")
  )),

  single("mpls-l3vpn", 1, "In an MPLS L3VPN, what is the purpose of a route distinguisher (RD)?", 0, quad(
    c("Make overlapping customer prefixes unique in the VPNv4/VPNv6 address space", "The RD distinguishes identical address prefixes from different VPN contexts."),
    c("Select which VRFs import a route", "Route targets, not RDs, determine VPN membership."),
    c("Encrypt customer traffic across the provider core", "MPLS labels and RDs do not themselves encrypt traffic."),
    c("Choose the customer-facing interface", "Interface attachment is separate from VPN route identification.")
  )),
  single("mpls-l3vpn", 2, "A VPNv4 route is present at a PE but absent from a customer's VRF. Which attribute should be examined for import eligibility?", 2, quad(
    c("The route's Ethernet VLAN tag", "A provider VPN route is imported by routing policy, not the customer's VLAN number."),
    c("The route's OSPF process ID", "OSPF process IDs do not define VPN import membership."),
    c("The route target extended community", "The VRF must import a matching RT for the VPN route."),
    c("The provider core's spanning-tree root", "Layer 2 root election does not control VRF import.")
  )),
  single("mpls-l3vpn", 3, "What does the outer transport label generally identify in an MPLS L3VPN forwarding stack?", 1, quad(
    c("The customer's original IPv4 subnet mask", "A label is not an IP prefix-length field."),
    c("A transport path toward the egress PE or next MPLS hop", "The outer label forwards the packet through the provider core."),
    c("The route target used for VRF import", "RTs are control-plane communities and are not the transport label."),
    c("The IPsec encryption key", "MPLS labels do not encode cryptographic keys.")
  )),
  single("mpls-l3vpn", 4, "A provider edge learns a customer prefix through MP-BGP VPNv4. Which additional information is commonly used to select the customer VRF at egress?", 3, quad(
    c("The core router's OSPF area number", "OSPF area membership does not identify the customer VRF."),
    c("The customer's DHCP relay address", "Relay information does not select MPLS VPN forwarding context."),
    c("A route-map sequence number as an MPLS payload", "Sequence numbers are policy configuration, not data-plane labels."),
    c("The VPN/VRF context and its associated label", "The VPN label identifies the egress VRF or forwarding context.")
  )),
  multi("mpls-l3vpn", 1, "Which two statements correctly distinguish RDs and RTs in MPLS L3VPNs?", [0, 1], quad(
    c("An RD makes otherwise overlapping customer routes unique", "VPNv4 route identity includes the RD with the IPv4 prefix."),
    c("An RT controls route import/export membership", "VRFs use RT policy to exchange VPN routes."),
    c("An RD encrypts the customer payload", "An RD is not a security or encryption feature."),
    c("An RT is the outer MPLS transport label", "Route targets are control-plane communities, not forwarding labels.")
  )),
  multi("mpls-l3vpn", 2, "Which two control-plane/data-plane checks help diagnose a VPN route that is present but not forwarded?", [2, 3], quad(
    c("Check only the PE's console authentication method", "Management login policy does not establish VPN forwarding."),
    c("Assume an imported route proves the MPLS core is operational", "Control-plane presence does not confirm label-switched forwarding."),
    c("Verify the VRF route, next-hop resolution, and VPN label", "The egress context and label are required to deliver traffic into the right VRF."),
    c("Check transport label reachability and core label switching", "The outer path must carry the packet to the egress PE.")
  )),
  ordering("mpls-l3vpn", "Arrange diagnosis of a missing MPLS L3VPN customer path.", quad(
    c("Test forwarding across the core and into the destination VRF", "Data-plane verification confirms actual customer reachability."),
    c("Confirm the customer's route is learned and exported by the ingress PE", "Route origination/export is the first control-plane boundary."),
    c("Check RT import and route installation at the egress VRF", "The destination VRF must accept the VPN route."),
    c("Verify transport and VPN labels toward the egress PE", "Label state connects VPN route knowledge to MPLS forwarding.")
  ), quad(1, 2, 3, 0)),
  simlet("mpls-l3vpn", "A customer route is not visible in VRF BLUE. Which two conclusions are supported?", [
    "PE2# show bgp vpnv4 unicast 10.60.0.0/16\nRD 65000:60, RT 65000:60\nPE2# show vrf BLUE detail\nImport RT: 65000:10\nPE2# show ip route vrf BLUE 10.60.0.0\n% Network not in table"
  ].join("\n"), [0, 3], quad(
    c("The VPN route carries RT 65000:60 while BLUE imports 65000:10", "The RT values do not match, so BLUE is not eligible to import this route."),
    c("The RD 65000:60 makes BLUE import it automatically", "The RD distinguishes the prefix but does not control import membership."),
    c("The route has already been installed in BLUE", "The route lookup says the prefix is absent."),
    c("The RT mismatch is a direct candidate cause of non-import", "Import RT policy explains why VPNv4 presence does not create a VRF route.")
  )),

  // Infrastructure security
  single("infrastructure-acls", 1, "A router management ACL should permit SSH only from the operations subnet while preserving other required control traffic. Which principle is most important?", 3, quad(
    c("Use a broad permit ip any any before the SSH rule", "An early broad permit defeats the intended management restriction."),
    c("Apply the ACL outbound on every data interface", "The direction and interface should match the management traffic path."),
    c("Rely only on a nonstandard SSH port", "Changing a port does not provide source authorization."),
    c("Order specific permitted management traffic before the implicit deny and test recovery", "ACL order and implicit deny can cause lockout; test allowed flows and recovery.")
  )),
  single("infrastructure-acls", 2, "An extended ACL entry intended to permit SSH from 192.0.2.0/24 to a router is not matching. Which destination port should its TCP condition specify?", 0, quad(
    c("22", "SSH uses TCP destination port 22 by default."),
    c("53", "Port 53 is used for DNS, not SSH."),
    c("67", "UDP 67 is used by DHCP servers, not SSH."),
    c("161", "SNMP commonly uses UDP 161, not SSH.")
  )),
  single("infrastructure-acls", 3, "An ACL is applied to the VTY lines rather than an interface. Which traffic is it intended to control?", 1, quad(
    c("Transit packets routed through the device", "VTY access controls management sessions, not general transit forwarding."),
    c("Remote terminal sessions attempting to access the device", "A VTY access-class restricts remote CLI connections."),
    c("Only DHCP broadcasts on a user VLAN", "VTY filters do not relay or filter DHCP broadcasts."),
    c("All packets entering the control plane", "VTY policy is specific to terminal access rather than all control-plane traffic.")
  )),
  single("infrastructure-acls", 4, "A standard IPv4 ACL is used to restrict management sources. Which field does it primarily match?", 2, quad(
    c("Destination TCP port", "Standard ACLs do not match transport ports."),
    c("Source and destination ports", "Transport-layer matching requires an extended ACL."),
    c("Source IPv4 address", "Standard ACLs primarily match source address."),
    c("Application payload signature", "An IP ACL is not a deep packet inspection policy.")
  )),
  multi("infrastructure-acls", 1, "Which two practices reduce the chance of locking out legitimate management during an ACL change?", [0, 2], quad(
    c("Preserve tested console or out-of-band access", "A recovery path protects against remote policy mistakes."),
    c("Place a deny-all entry first", "An early deny blocks the intended management sources."),
    c("Validate source, direction, protocol, and destination with a pilot", "A scoped pilot checks that the policy matches real management flows."),
    c("Remove logging and counters before testing", "Counters and logs help confirm the ACL's actual matches.")
  )),
  multi("infrastructure-acls", 2, "A management-plane ACL must allow SSH from NOC hosts and SNMPv3 polling from a collector. Which two statements are correct?", [1, 3], quad(
    c("Permit all UDP sources because SNMPv3 is encrypted", "Encryption does not justify unrestricted source access."),
    c("Permit only required sources and protocol/port combinations", "Least privilege restricts each management service to its authorized endpoints."),
    c("SNMPv3 uses TCP port 22", "TCP 22 is the normal SSH port, not SNMP."),
    c("Review ACL direction and device-local management destinations", "The access point must align with where and how management traffic reaches the device.")
  )),
  ordering("infrastructure-acls", "Arrange a remote management ACL change to minimize lockout risk.", quad(
    c("Verify permitted SSH/SNMP flows, counters, and recovery access", "Post-change verification confirms expected services and fallback."),
    c("Inventory approved sources and required management services", "The allow-list must be known before writing policy."),
    c("Build a narrow ordered ACL and stage it on one device", "A scoped pilot limits the effect of mistakes."),
    c("Apply at the correct management point with rollback ready", "Controlled application retains a way to recover.")
  ), quad(1, 2, 3, 0)),
  simlet("infrastructure-acls", "Operators report SSH failure after an ACL change. Which two observations indicate a rule-order/scope problem?", [
    "RTR# show access-lists MGMT\n10 deny ip any any (18 matches)\n20 permit tcp 192.0.2.0 0.0.0.255 any eq 22 (0 matches)\nRTR# show line vty 0 4\n access-class MGMT in"
  ].join("\n"), [0, 2], quad(
    c("The deny sequence precedes and shadows the intended permit", "ACLs are evaluated top-down, so the first deny matches before the permit."),
    c("The SSH permit counter shows successful matches", "Its counter is zero, not evidence of successful matching."),
    c("The VTY access-class applies the ACL to inbound terminal sessions", "The output confirms MGMT is applied inbound to VTY lines."),
    c("The ACL is applied only to routed transit traffic", "The shown VTY binding controls terminal access.")
  )),

  single("enarsi-aaa-hardening", 1, "Which AAA service is commonly used for centralized command authorization on network devices?", 2, quad(
    c("NTP", "NTP synchronizes time and does not authorize commands."),
    c("SNMP", "SNMP monitors or configures management objects; it is not AAA command authorization."),
    c("TACACS+", "TACACS+ commonly supports granular command authorization and accounting."),
    c("DHCP", "DHCP provides address configuration rather than CLI authorization.")
  )),
  single("enarsi-aaa-hardening", 2, "A router must retain emergency console access if centralized AAA servers are unreachable. Which fallback is safest?", 0, quad(
    c("A tested, least-privilege local recovery identity with audited use", "A controlled local fallback supports recovery without becoming a broad shared bypass."),
    c("An unauthenticated VTY line", "Unauthenticated remote access creates an unacceptable exposure."),
    c("A shared administrator password written on the console", "Shared credentials undermine accountability and protection."),
    c("Disable all local authentication permanently", "Removing fallback can make an AAA outage unrecoverable.")
  )),
  single("enarsi-aaa-hardening", 3, "Why should a TACACS+ server be reachable through a protected management path with redundant availability?", 3, quad(
    c("It allows user traffic to bypass routing policy", "AAA server placement should not bypass user-plane controls."),
    c("It removes the need for authentication accounting", "Connectivity does not replace accounting."),
    c("It guarantees every command is permitted", "AAA authorization policies can allow or deny specific actions."),
    c("It protects credentials/control traffic and reduces lockout risk during an outage", "Secure, redundant reachability supports AAA while limiting exposure and failures.")
  )),
  single("enarsi-aaa-hardening", 4, "A user can log in but a privileged command is rejected. Which AAA function is most directly involved?", 1, quad(
    c("Authentication", "Authentication verifies identity during login."),
    c("Authorization", "Authorization determines whether the authenticated user may run a command."),
    c("Accounting", "Accounting records actions but does not itself grant permission."),
    c("Address resolution", "ARP/ND resolution does not authorize CLI commands.")
  )),
  multi("enarsi-aaa-hardening", 1, "Which two checks validate role-based centralized AAA behavior?", [0, 3], quad(
    c("Test permitted and denied commands for each role", "Explicit command tests confirm authorization boundaries."),
    c("Use the same unrestricted privilege for every user", "Uniform unrestricted access defeats role separation."),
    c("Disable accounting to reduce server traffic", "Accounting records support auditability and should not be discarded casually."),
    c("Verify accounting records reach the intended collector", "Collector confirmation verifies that actions are actually recorded.")
  )),
  multi("enarsi-aaa-hardening", 2, "Which two controls strengthen device management access without eliminating operational recovery?", [1, 2], quad(
    c("Expose Telnet from every reachable network", "Telnet sends credentials in clear text and broad access increases exposure."),
    c("Restrict SSH and management protocols to approved sources", "Source restrictions reduce management-plane exposure."),
    c("Keep a tested console/out-of-band path and controlled local fallback", "Recovery remains possible if remote AAA or ACL policy fails."),
    c("Store AAA shared secrets in publicly readable configuration backups", "Secrets must be protected from unauthorized disclosure.")
  )),
  ordering("enarsi-aaa-hardening", "Arrange a centralized AAA change while preserving emergency access.", quad(
    c("Verify allowed/denied roles, accounting, and fallback behavior", "Testing confirms the operational and audit outcomes."),
    c("Confirm server reachability, protected transport, and time sync", "AAA dependencies should be checked before policy activation."),
    c("Configure role-specific authorization and protected local fallback", "Apply least privilege while retaining recovery."),
    c("Pilot the change and test server-timeout recovery from console", "A pilot validates the failure path before broader rollout.")
  ), quad(1, 2, 3, 0)),
  simlet("enarsi-aaa-hardening", "A NOC role should be read-only, but command authorization appears ineffective. Which two conclusions follow?", [
    "RTR# show aaa servers\nTACACS1 192.0.2.40 state UP\nRTR# show aaa user all\nuser=ops role=netops\nRTR# show accounting\ncommand=configure terminal status=denied collector=192.0.2.60"
  ].join("\n"), [0, 2], quad(
    c("The TACACS+ server is reachable according to the displayed state", "The server is shown UP."),
    c("The accounting collector is unreachable", "A command record is shown with the collector address."),
    c("The attempted configuration command was denied and accounted", "The record explicitly shows status denied and the command."),
    c("The output proves read-only authorization is not configured", "A denied command is consistent with read-only authorization; additional tests are needed.")
  )),

  single("urpf-copp-security", 1, "A multihomed edge has legitimate asymmetric return paths. Which uRPF mode is generally less likely than strict mode to drop valid traffic?", 1, quad(
    c("Strict uRPF", "Strict mode expects the best reverse path to use the packet's ingress interface."),
    c("Loose uRPF", "Loose mode checks that a source route exists, not necessarily through the ingress interface."),
    c("Spanning-tree uRPF", "No such uRPF mode exists; STP is a Layer 2 loop protocol."),
    c("DHCP uRPF", "DHCP is not an uRPF validation mode.")
  )),
  single("urpf-copp-security", 2, "What is the primary purpose of Control Plane Policing (CoPP)?", 3, quad(
    c("Encrypt transit packets between interfaces", "CoPP rate-limits/classifies CPU-bound traffic; it does not encrypt transit data."),
    c("Validate source prefixes on every transit packet", "That is the role of uRPF, not CoPP."),
    c("Replace interface ACLs on all data-plane traffic", "CoPP protects traffic destined to the control plane."),
    c("Classify and rate-limit traffic destined for the device CPU", "CoPP protects CPU resources from excessive control-plane traffic.")
  )),
  single("urpf-copp-security", 3, "Strict uRPF drops packets from a legitimate remote source after a routing change. What is a plausible cause?", 0, quad(
    c("The best reverse route now points to an interface other than the ingress", "Strict mode can reject asymmetric packets when the reverse path differs."),
    c("The source has a valid route through the ingress interface", "That condition generally satisfies strict reverse-path checking."),
    c("The packet has a valid TCP checksum", "A valid checksum does not cause uRPF failure."),
    c("The router has an NTP server configured", "NTP configuration is unrelated to source validation.")
  )),
  single("urpf-copp-security", 4, "A CoPP policy unexpectedly drops routing-protocol packets. Which change best addresses the risk?", 2, quad(
    c("Disable all control-plane policing indefinitely", "Removing protection entirely is not a targeted correction."),
    c("Apply strict uRPF to the CPU queue", "uRPF and CoPP solve different problems."),
    c("Review class matches, rate limits, counters, and required control traffic", "The policy must protect the CPU while permitting necessary protocol rates."),
    c("Increase every class to unlimited rates", "Unlimited rates remove the protection against overload.")
  )),
  multi("urpf-copp-security", 1, "Which two statements correctly distinguish uRPF and CoPP?", [0, 2], quad(
    c("uRPF checks source reachability against routing information", "It helps filter spoofed source addresses using reverse path information."),
    c("CoPP encrypts management traffic", "CoPP provides rate control, not encryption."),
    c("CoPP classifies and rate-limits traffic destined to the control plane", "Its purpose is to protect CPU-bound services."),
    c("uRPF guarantees symmetric routing", "uRPF checks source plausibility; it does not make paths symmetric.")
  )),
  multi("urpf-copp-security", 2, "Before enforcing uRPF or tightening CoPP, which two practices reduce outage risk?", [1, 3], quad(
    c("Assume every control packet has identical volume", "Routing and management control traffic can vary and need measured limits."),
    c("Model asymmetric routes and required control-plane dependencies", "Path and protocol analysis avoids legitimate packet drops."),
    c("Drop all packets with a source in a private address range on every interface", "Private ranges can be legitimate internally and need interface-specific policy."),
    c("Stage changes while observing counters and testing known flows", "Observation and staged validation reveal false positives before broad enforcement.")
  )),
  ordering("urpf-copp-security", "Arrange a safe control-plane/source-validation policy deployment.", quad(
    c("Monitor drops and verify routing, management, and recovery traffic", "Operational monitoring confirms that protection is not disrupting required services."),
    c("Map expected source paths and CPU-bound protocol requirements", "Understand asymmetry and legitimate control traffic first."),
    c("Select appropriate uRPF modes and CoPP classes/rates", "Policy should be matched to the threat and observed traffic."),
    c("Observe counters in a staged rollout before enforcement", "Staged monitoring limits risk before full activation.")
  ), quad(1, 2, 3, 0)),
  simlet("urpf-copp-security", "A branch reports routing instability after CoPP activation. Which two observations best explain the issue?", [
    "Edge# show policy-map control-plane\nclass ROUTING\n packets 42000, drops 1800, configured rate 500 pps\nEdge# show ip ospf neighbor\nNeighbor 2.2.2.2 State EXSTART\nEdge# show ip interface Gi0/0\nIP verify source reachable-via rx"
  ].join("\n"), [0, 2], quad(
    c("The ROUTING class is dropping packets under its configured rate", "The output shows 1,800 drops in the routing class."),
    c("The interface proves every source route is symmetric", "The output states strict reachable-via-rx but does not prove symmetry."),
    c("CoPP may be discarding control traffic needed for routing stability", "Drops in the routing class can disrupt protocol exchanges."),
    c("The OSPF neighbor is FULL", "The neighbor is shown EXSTART, not FULL.")
  )),

  // Infrastructure services
  single("dhcp-relay-services", 1, "A DHCP server is on another subnet. What information from the relay commonly lets it choose the correct client scope?", 1, quad(
    c("The client's DNS query name", "DNS is not normally how the server identifies the originating subnet."),
    c("The relay's gateway address (giaddr)", "The relay provides its address so the server can select the corresponding scope."),
    c("The router's OSPF router ID", "OSPF router ID does not identify the DHCP client subnet."),
    c("The destination MAC of the remote server", "A remote server MAC is not conveyed as the client scope selector.")
  )),
  single("dhcp-relay-services", 2, "Clients send DHCPDISCOVER as a local broadcast and a router does not forward it normally. What does a configured helper/relay do?", 0, quad(
    c("Forwards the request as unicast toward configured DHCP servers", "A relay carries client requests across the routed boundary."),
    c("Converts the broadcast into an OSPF LSA", "DHCP relay does not inject routing LSAs."),
    c("Assigns the lease without contacting a server", "The relay forwards requests; the server allocates the lease."),
    c("Encrypts the client Ethernet frame", "A relay does not encrypt DHCP broadcasts.")
  )),
  single("dhcp-relay-services", 3, "A relay forwards requests to two DHCP servers, but clients receive no offer. Which return-path condition must be verified?", 3, quad(
    c("The DHCP server's spanning-tree priority", "STP priority does not return a routed DHCP reply."),
    c("The client's DNS suffix", "DNS suffix distribution occurs after lease assignment."),
    c("The relay's syslog facility", "Syslog settings do not determine DHCP reply delivery."),
    c("The server can route the reply to the relay/client subnet and required UDP is allowed", "Server return reachability and filtering are required for the offer to arrive.")
  )),
  single("dhcp-relay-services", 4, "A DHCP scope is selected incorrectly when requests pass through a relay. Which relay metadata policy should be checked?", 2, quad(
    c("The OSPF external metric type", "OSPF metric type does not control DHCP scope selection."),
    c("The router's VTY login method", "VTY authentication is unrelated to relay metadata."),
    c("Option 82 handling and the relay gateway address", "Server policy may use relay agent information or giaddr to choose a scope."),
    c("The client's NTP stratum", "NTP state does not select an address pool.")
  )),
  multi("dhcp-relay-services", 1, "A remote VLAN's clients fail to obtain leases. Which two checks are relevant at the relay boundary?", [0, 3], quad(
    c("Verify the SVI is up and helper targets are correct", "The relay must be active on the client subnet and point to valid servers."),
    c("Change the DHCP server's OSPF router ID", "Router ID changes do not fix helper forwarding."),
    c("Disable all ACLs on the network", "Broadly removing ACLs is unsafe; inspect only required DHCP flows."),
    c("Check return routing and UDP 67/68 filtering", "Offer/ack traffic must traverse the return path and permitted filters.")
  )),
  multi("dhcp-relay-services", 2, "Which two statements about DHCP relay processing are correct?", [1, 2], quad(
    c("The relay replaces the DHCP server's address pool", "The server still maintains and selects the scope."),
    c("The relay forwards client broadcasts across a routed boundary", "That is the primary purpose of a relay agent."),
    c("The relay can add gateway/agent information for server policy", "Relay metadata can help choose a subnet or apply policy."),
    c("A successful ping to the server proves DHCP UDP works", "ICMP reachability does not verify DHCP ports or relay exchange.")
  )),
  ordering("dhcp-relay-services", "Arrange troubleshooting of a DHCP failure on a routed client VLAN.", quad(
    c("Confirm the full Discover, Offer, Request, Ack exchange and lease", "End-to-end protocol evidence confirms service recovery."),
    c("Verify the VLAN SVI, client broadcast, and helper configuration", "Check the first-hop relay before chasing the remote server."),
    c("Check route, ACL, and server scope/relay metadata", "Forward and return paths plus scope selection must be valid."),
    c("Inspect relay/server logs and counters for the missing exchange step", "Targeted evidence identifies where DORA stops.")
  ), quad(1, 2, 3, 0)),
  simlet("dhcp-relay-services", "Clients in VLAN 40 send Discover messages but receive no Offer. Which two observations are most relevant?", [
    "Core# show running-config interface Vlan40\nip helper-address 192.0.2.50\nCore# show ip route 192.0.2.50\n% Network not in table\nCore# show ip dhcp relay statistics\nDiscover forwarded: 14  Offer received: 0"
  ].join("\n"), [1, 3], quad(
    c("The server route is present and reachable", "The route lookup explicitly reports no route."),
    c("A helper target is configured on VLAN 40", "The interface configuration includes the server address."),
    c("The output confirms DHCP offers have been received", "Offer received is zero."),
    c("The relay lacks a route to the configured server", "No route to 192.0.2.50 explains why forwarded offers cannot return.")
  )),

  single("infrastructure-operations", 1, "A syslog event and IP SLA probe appear several minutes apart across routers. What foundational service should be checked before correlating the incident timeline?", 2, quad(
    c("DNS round-robin order", "DNS record order does not align device event timestamps."),
    c("The spanning-tree root", "STP root selection does not correct clock skew."),
    c("NTP synchronization and device clock offsets", "Consistent time is necessary to order events across devices."),
    c("The BGP route distinguisher", "An RD has no role in timestamp correlation.")
  )),
  single("infrastructure-operations", 2, "What does an IP SLA probe measure that a routing-table entry alone does not?", 0, quad(
    c("Observed reachability or performance for a configured synthetic operation", "A probe tests a measured path/target rather than merely listing a route."),
    c("The exact user experience for every application", "Synthetic probes do not represent every application transaction."),
    c("The device's full packet-capture history", "IP SLA is not a packet-capture archive."),
    c("The remote router's configuration compliance", "IP SLA measures operations, not configuration posture.")
  )),
  single("infrastructure-operations", 3, "Flow telemetry shows a sudden increase in one source-destination conversation. What is the most accurate conclusion?", 3, quad(
    c("The flow record proves the application is healthy", "Traffic volume alone does not establish application health."),
    c("The source is necessarily malicious", "A volume increase needs context and is not proof of attack."),
    c("The route is installed with the correct next hop", "Flow records do not by themselves establish RIB correctness."),
    c("The conversation's observed traffic volume or pattern changed", "Flow data describes observed traffic, not complete application or routing health.")
  )),
  single("infrastructure-operations", 4, "A collector stops receiving SNMP telemetry while devices remain reachable by SSH. Which cause should be checked?", 1, quad(
    c("The SSH host key type only", "SSH host key configuration does not determine SNMP polling delivery."),
    c("SNMP credentials, source ACL, UDP reachability, and collector health", "A failure in credentials, path, filtering, or collector can stop telemetry independently of SSH."),
    c("The switch's IPv6 router advertisement lifetime", "RA lifetime does not explain SNMP collector reception by itself."),
    c("The client VLAN's DHCP lease duration", "DHCP lease timing is not the SNMP polling path.")
  )),
  multi("infrastructure-operations", 1, "Which two practices improve correlation of network telemetry during an outage?", [0, 2], quad(
    c("Synchronize device clocks and collector time", "Consistent timestamps allow events to be placed in a reliable sequence."),
    c("Discard raw records once a dashboard is rendered", "Raw evidence may be needed to validate interpretation."),
    c("Correlate syslog changes with counters, flow, and synthetic probes", "Independent evidence sources strengthen the incident timeline."),
    c("Assume one synthetic target represents every user path", "A probe samples only its configured operation and destination.")
  )),
  multi("infrastructure-operations", 2, "A telemetry collector appears healthy but has gaps. Which two limitations should be considered?", [1, 3], quad(
    c("SNMP and syslog always use the same transport and failure mode", "They have distinct protocols and collection paths."),
    c("Polling intervals may miss short-lived events", "Periodic samples can overlook changes between polls."),
    c("An IP SLA result proves every application transaction succeeded", "Synthetic measurements are not a complete application test."),
    c("Clock skew or collector-path loss can create apparent gaps", "Timestamp errors and transport failures can distort the record.")
  )),
  ordering("infrastructure-operations", "Arrange building a trustworthy timeline for a routing incident.", quad(
    c("Correlate route changes with probes, counters, and flow evidence", "Correlation combines the synchronized evidence."),
    c("Confirm NTP state and collector timestamps", "Timestamp quality is the basis for sequencing."),
    c("Collect raw syslog, telemetry, and routing-change records", "Gather primary evidence before forming conclusions."),
    c("Validate the suspected timeline against topology and change history", "Context testing guards against misleading correlations.")
  ), quad(1, 2, 0, 3)),
  simlet("infrastructure-operations", "A team suspects a WAN outage at 14:05. Which two observations support a link/path incident rather than a device-wide loss of telemetry?", [
    "R5# show clock\n14:06:12 UTC, synchronized\nR5# show logging | include Gi0/1\n14:05:02 %LINK-3-UPDOWN: Interface Gi0/1 changed state to down\nR5# show ip sla statistics 8\nLatest RTT: timeout\nCollector# last syslog received from R5: 14:05:08"
  ].join("\n"), [0, 2], quad(
    c("The synchronized clock and interface-down event place a link failure near 14:05", "The event is timestamped by a synchronized device at the suspected time."),
    c("The collector has received no logs from R5 at all", "It received a log at 14:05:08."),
    c("IP SLA timeout corroborates loss of the measured path", "The synthetic probe timed out near the interface event."),
    c("These records prove all applications at the site failed", "The evidence indicates a path issue but cannot establish every application impact.")
  )),

  single("ipv6-first-hop-security", 1, "A host on a shared LAN receives a rogue IPv6 router advertisement. Which switch feature is designed to control which ports may send trusted RAs?", 1, quad(
    c("DHCP snooping database", "DHCP snooping tracks DHCP bindings, not IPv6 router advertisements."),
    c("RA Guard", "RA Guard filters router advertisements based on port policy."),
    c("BGP prefix dampening", "Prefix dampening addresses route flaps, not Layer 2 RAs."),
    c("IP SLA tracking", "IP SLA measures reachability and does not filter RAs.")
  )),
  single("ipv6-first-hop-security", 2, "What is the primary purpose of IPv6 Neighbor Discovery Inspection (ND inspection) on a Layer 2 network?", 3, quad(
    c("Encrypt neighbor solicitation messages", "ND inspection does not encrypt Neighbor Discovery."),
    c("Replace IPv6 routing protocols", "It is a Layer 2 security control, not a routing protocol."),
    c("Assign global IPv6 prefixes to hosts", "Prefix assignment can use other mechanisms; inspection validates traffic."),
    c("Validate Neighbor Discovery messages against trusted bindings/policy", "ND inspection mitigates spoofed or invalid neighbor information.")
  )),
  single("ipv6-first-hop-security", 3, "A network uses DHCPv6 snooping bindings to validate IPv6 source addresses. What is a key limitation to account for?", 0, quad(
    c("Statically configured hosts may lack dynamic bindings and need explicit policy", "Binding-based checks can reject legitimate static addresses without provisioning."),
    c("It blocks all router advertisements by design", "DHCPv6 snooping does not inherently replace RA policy."),
    c("It validates IPv4 ARP entries only", "DHCPv6 snooping concerns IPv6 DHCP messages and bindings."),
    c("It requires every host to use a public IPv4 address", "IPv4 addressing is unrelated to IPv6 binding validation.")
  )),
  single("ipv6-first-hop-security", 4, "A malicious host sends forged Neighbor Advertisements to redirect local IPv6 traffic. Which security objective is most directly relevant?", 2, quad(
    c("Protect the BGP AS path", "BGP path attributes do not validate local neighbor advertisements."),
    c("Suppress all IPv6 multicast", "ND relies on multicast; disabling it breaks normal IPv6 behavior."),
    c("Validate neighbor bindings and restrict untrusted Layer 2 ports", "Binding-aware ND controls help prevent forged address-to-MAC claims."),
    c("Enable DHCP relay on every access port", "DHCP relay does not prevent forged Neighbor Advertisements.")
  )),
  multi("ipv6-first-hop-security", 1, "Which two IPv6 first-hop defenses address rogue router advertisements and forged neighbor information?", [0, 3], quad(
    c("RA Guard on untrusted access ports", "RA Guard restricts unauthorized router advertisements."),
    c("BGP maximum-prefix on every host port", "BGP maximum-prefix does not filter Layer 2 IPv6 control messages."),
    c("Disable all ICMPv6 traffic", "IPv6 relies on ICMPv6 for essential neighbor and path functions."),
    c("ND inspection or source validation based on trusted bindings", "Binding validation mitigates forged neighbor/source claims.")
  )),
  multi("ipv6-first-hop-security", 2, "Before enabling IPv6 first-hop inspection broadly, which two conditions should be validated?", [1, 2], quad(
    c("Assume every endpoint obtains addresses through DHCPv6", "Static and SLAAC hosts may not have DHCPv6 bindings."),
    c("Identify trusted router ports and legitimate RA sources", "RA policy must distinguish authorized infrastructure from hosts."),
    c("Account for SLAAC, DHCPv6, and statically addressed hosts", "Address acquisition modes affect valid inspection behavior."),
    c("Block Neighbor Discovery to remove spoofing opportunities", "ND is necessary for ordinary IPv6 operation.")
  )),
  ordering("ipv6-first-hop-security", "Arrange a safe deployment of IPv6 first-hop protections.", quad(
    c("Monitor violation counters and test host/router reachability", "Post-change verification detects legitimate traffic being blocked."),
    c("Inventory router ports, address-assignment methods, and bindings", "Accurate trust and endpoint information comes first."),
    c("Configure RA/ND/source validation policy for the known topology", "Apply policy based on observed legitimate behavior."),
    c("Stage controls on a pilot VLAN before scaling", "A pilot reduces the risk of widespread host connectivity loss.")
  ), quad(1, 2, 3, 0)),
  simlet("ipv6-first-hop-security", "Users report IPv6 default-gateway failures after RA Guard deployment. Which two conclusions are supported?", [
    "SW1# show ipv6 snooping policy\nVLAN 30 RA Guard enabled\nSW1# show ipv6 nd raguard statistics\nGi1/0/8: dropped RA 47\nGi1/0/8 role: host\nSW1# show ipv6 neighbors\n2001:db8:30::1 incomplete"
  ].join("\n"), [0, 2], quad(
    c("RAs arriving on Gi1/0/8 are being dropped while that port is classified as a host", "The counters and role indicate router advertisements are blocked on that port."),
    c("The output proves the gateway is reachable at Layer 2", "The neighbor state is incomplete, not resolved."),
    c("The IPv6 neighbor entry for the gateway is unresolved", "The entry state is explicitly incomplete."),
    c("Disabling all ICMPv6 would be a safe fix", "ICMPv6 is essential; correct trust/port policy should be investigated.")
  )),
  single("routing-troubleshooting", 1, "A router has a route in its RIB, but packets to the prefix are discarded. Which additional forwarding-plane state should be checked?", 2, quad(
    c("The route-map description text", "A description does not prove that the forwarding entry was programmed."),
    c("The remote router's console history", "Console history does not show this router's installed forwarding state."),
    c("The FIB/CEF entry and resolved adjacency", "The data plane needs a usable forwarding entry and next-hop adjacency."),
    c("The DHCP lease time on the source host", "Lease duration does not explain a RIB-to-FIB forwarding failure.")
  )),
  single("routing-troubleshooting", 2, "A route is missing from the RIB even though the routing protocol has learned the prefix. What should be checked first?", 0, quad(
    c("Competing route sources, administrative distance, and route validity", "A route may be learned yet lose selection or fail next-hop validation."),
    c("Whether the device has an unused console port", "Console availability does not affect route installation."),
    c("The destination's DNS canonical name", "DNS naming does not determine route selection."),
    c("The interface description's capitalization", "Description text has no effect on route installation.")
  )),
  single("routing-troubleshooting", 3, "A recursive static route points to a next-hop address that is itself unreachable. What is the likely forwarding result?", 3, quad(
    c("The router forwards using the unresolved address as an Ethernet destination", "IP next hops must be resolved through a valid route and adjacency."),
    c("The router automatically discovers an alternate protocol", "Routers do not automatically invent an alternate route when recursion fails."),
    c("The route becomes a directly connected route", "Recursive resolution does not change the route's source or connected status."),
    c("The route may not be usable because next-hop resolution fails", "A recursive next hop must resolve to a reachable forwarding path.")
  )),
  single("routing-troubleshooting", 4, "Traceroute stops at one hop, while the destination application is intermittently reachable. What is the best interpretation?", 1, quad(
    c("The final destination is certainly down", "Traceroute probes may be filtered even when application traffic succeeds."),
    c("Intermediate-hop responses may be filtered or rate-limited; corroborate with end-to-end tests", "A missing TTL-expired response alone does not prove that forwarding has stopped."),
    c("The routing table must contain a loop", "A traceroute gap does not by itself establish a routing loop."),
    c("The source host's ARP cache is necessarily corrupt", "An intermediate response gap does not identify a local ARP fault.")
  )),
  multi("routing-troubleshooting", 1, "A destination is unreachable despite an expected protocol route. Which two comparisons help isolate control-plane versus forwarding-plane failure?", [0, 3], quad(
    c("Compare the protocol database/RIB with the installed FIB and adjacency", "This reveals whether learned reachability was selected and programmed for forwarding."),
    c("Compare router prompt colors across devices", "Prompt colors do not provide routing evidence."),
    c("Compare application source-code formatting", "Application formatting does not locate a network forwarding fault."),
    c("Trace next-hop resolution and return routing at successive hops", "An unresolved next hop or missing return path can break end-to-end traffic.")
  )),
  multi("routing-troubleshooting", 2, "Which two practices improve the quality of a routing incident diagnosis?", [1, 2], quad(
    c("Change several routing protocols at once to see which fixes it", "Multiple simultaneous changes obscure cause and can increase impact."),
    c("Capture time-stamped route, neighbor, and interface evidence before changing state", "A baseline preserves the conditions needed to locate the fault."),
    c("Test from more than one source and direction where practical", "Different vantage points can reveal scope and asymmetric return-path problems."),
    c("Treat every traceroute timeout as proof that a hop drops transit packets", "Routers can forward traffic while filtering or rate-limiting probe responses.")
  )),
  ordering("routing-troubleshooting", "Arrange a routing outage investigation from initial evidence to controlled remediation.", quad(
    c("Verify end-to-end traffic and monitor after the targeted correction", "Post-change testing and monitoring confirm recovery."),
    c("Define affected prefixes, sources, destinations, and time window", "Scoping separates a local symptom from a broad failure."),
    c("Compare protocol state, RIB selection, FIB, and next-hop resolution", "Layered routing evidence locates the control/data-plane boundary."),
    c("Make one reversible change and retest the original flow", "A scoped correction provides interpretable results and a rollback path.")
  ), quad(1, 2, 3, 0)),
  simlet("routing-troubleshooting", "Hosts report intermittent loss to 10.55.8.20. Which two diagnoses are supported by these snapshots?", [
    "R4# show ip route 10.55.8.0/24\nO 10.55.8.0/24 via 192.0.2.2\nR4# show ip cef 10.55.8.20\n10.55.8.0/24 unresolved adjacency\nR4# show ip arp 192.0.2.2\nInternet 192.0.2.2  -  Incomplete"
  ].join("\n"), [0, 2], quad(
    c("The route exists in the RIB but its forwarding adjacency is unresolved", "The route is installed while CEF and ARP show unresolved next-hop state."),
    c("The destination prefix is absent from the routing table", "The RIB output shows an OSPF route for the prefix."),
    c("The next-hop adjacency is a likely data-plane failure point", "An incomplete ARP entry prevents forwarding to the selected IPv4 next hop."),
    c("The output proves OSPF adjacency to 192.0.2.2 is down", "A route is present, and ARP incompleteness alone does not prove OSPF neighbor state.")
  ))
];

export const enarsiQuestions: AssessmentQuestion[] = topics;
