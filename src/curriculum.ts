import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ccnpCurriculum } from "./ccnpContent";
export { ccnpCurriculum };

export type Topic = {
  id: string;
  title: string;
  explanation: string;
  example: string;
};

export type Domain = {
  id: string;
  title: string;
  weight: number;
  color: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  exam?: "CCNA" | "ENCOR" | "ENARSI";
  topics: Topic[];
};

export const curriculum: Domain[] = [
  {
    id: "fundamentals",
    title: "Network Fundamentals",
    weight: 20,
    color: "#3978F6",
    icon: "globe-outline",
    topics: [
      { id: "network-devices", title: "Network devices and roles", explanation: "Routers connect different IP networks. Switches forward frames inside a LAN, while access points connect wireless clients.", example: "A laptop sends traffic through its access point and switch to a router before reaching another network." },
      { id: "topologies", title: "Network architectures and topologies", explanation: "A topology describes how devices and links are arranged. Common designs include star, mesh, two-tier, three-tier, spine-and-leaf, WAN, and SOHO.", example: "In a star LAN, every workstation connects to a central switch; one workstation cable failure usually affects only that workstation." },
      { id: "cabling", title: "Interfaces, media, and cabling", explanation: "Ethernet interfaces use copper or fiber media, each with different distance, speed, and installation characteristics.", example: "Use copper Ethernet for a nearby desktop and fiber for a longer building-to-building uplink." },
      { id: "interface-errors", title: "Interface and cable issues", explanation: "Physical faults, speed or duplex mismatches, and interface errors can cause poor connectivity.", example: "A rising CRC error count can point to a damaged cable or a physical-layer issue." },
      { id: "tcp-udp", title: "TCP and UDP", explanation: "TCP provides ordered, reliable delivery. UDP has less transport overhead and does not establish the same connection-oriented delivery.", example: "A file transfer commonly values TCP reliability; a live voice call often prioritizes low delay." },
      { id: "ipv4-subnetting", title: "IPv4 addressing and subnetting", explanation: "An IPv4 prefix separates the network portion of an address from its host portion. Subnetting divides a larger network into smaller ones.", example: "A /26 has 64 total addresses and typically 62 usable host addresses." },
      { id: "private-ipv4", title: "Private IPv4 addressing", explanation: "Private IPv4 ranges are intended for internal networks and are not globally routed on the public internet.", example: "10.20.1.15 is in the private 10.0.0.0/8 range; a gateway may translate it with NAT for internet access." },
      { id: "ipv6-addressing", title: "IPv6 addressing and address types", explanation: "IPv6 uses 128-bit addresses and prefix lengths. Important types include global unicast, link-local, unique local, multicast, and anycast.", example: "In 2001:db8:1:2::25/64, the first 64 bits identify the subnet prefix." },
      { id: "client-ip-config", title: "Client IP configuration", explanation: "A host needs suitable address settings, a subnet prefix or mask, and usually a default gateway and DNS server.", example: "If a PC has no valid address or gateway, inspect its DHCP lease and local network configuration." },
      { id: "wireless-basics", title: "Wireless principles", explanation: "Wireless performance depends on factors such as frequency band, channel use, signal strength, and interference.", example: "Two nearby access points on overlapping channels may interfere and reduce throughput." },
      { id: "virtualization", title: "Virtualization", explanation: "Virtual machines and virtual network functions use software-defined compute and networking resources.", example: "A VM sends frames through a virtual switch before traffic reaches the physical network interface." },
      { id: "switching-concepts", title: "Switching concepts", explanation: "A switch learns source MAC addresses, forwards known unicast frames, and floods unknown unicast and broadcast frames within a VLAN.", example: "When a switch has not learned the destination MAC yet, it floods the frame out eligible ports in that VLAN." }
    ]
  },
  {
    id: "network-access",
    title: "Network Access",
    weight: 20,
    color: "#7A59E8",
    icon: "git-network-outline",
    topics: [
      { id: "vlans", title: "VLANs and port membership", explanation: "VLANs logically segment a switched network into separate Layer 2 broadcast domains.", example: "Assigning employee and guest devices to different VLANs keeps their Layer 2 traffic separate." },
      { id: "trunks", title: "Trunks and inter-VLAN concepts", explanation: "Access ports usually carry one VLAN. Trunk links carry multiple VLANs using tags; routing is needed for communication between VLANs.", example: "A switch-to-switch trunk can carry VLANs 10 and 20 between floors." },
      { id: "discovery-protocols", title: "CDP and LLDP", explanation: "Neighbor discovery protocols advertise information about directly connected network devices.", example: "Neighbor output can help identify which switch port connects to a router." },
      { id: "etherchannel", title: "EtherChannel and LACP", explanation: "EtherChannel bundles physical links into one logical link; LACP can negotiate the bundle.", example: "Two compatible links bundled together can provide additional capacity and link redundancy." },
      { id: "spanning-tree", title: "Spanning Tree and Rapid PVST+", explanation: "Spanning Tree prevents Layer 2 loops by selecting a loop-free forwarding topology while keeping redundant paths available.", example: "A redundant switch link can be placed in a non-forwarding role to prevent a broadcast loop." },
      { id: "edge-protection", title: "PortFast and BPDU Guard", explanation: "PortFast helps appropriate endpoint-facing ports transition quickly to forwarding. BPDU Guard protects such ports if they receive a BPDU.", example: "Enable BPDU Guard on a user-facing edge port to catch an unexpected switch connection." },
      { id: "wireless-architecture", title: "Wireless architectures and AP modes", explanation: "Wireless LAN designs use access points and may use centralized controllers to manage configuration and client access.", example: "A centrally managed AP can receive its WLAN configuration from a wireless LAN controller." },
      { id: "wireless-connections", title: "Wireless physical connections", explanation: "Access points and controllers connect into the wired network, where VLANs and IP connectivity support wireless service.", example: "Trace a client from its radio connection through an AP uplink to the assigned network VLAN." },
      { id: "wlan-security", title: "WLAN configuration and security", explanation: "A WLAN combines an SSID, network mapping, and authentication and encryption settings.", example: "Create an office SSID, map it to the intended VLAN, and protect it with WPA2-PSK." }
    ]
  },
  {
    id: "ip-connectivity",
    title: "IP Connectivity",
    weight: 25,
    color: "#E98B3D",
    icon: "navigate-outline",
    topics: [
      { id: "routing-table", title: "Read a routing table", explanation: "A routing table lists known destination prefixes and how to reach them, including route sources, next hops, and outgoing interfaces.", example: "A route for 192.168.20.0/24 via 10.0.0.2 identifies the next hop for that network." },
      { id: "route-selection", title: "Route selection and longest-prefix match", explanation: "Routers choose the matching route with the most specific prefix. Route source preference and metrics help select among routes to the same prefix.", example: "A /24 route is preferred over a /16 route for an address that matches both." },
      { id: "static-routes", title: "IPv4 and IPv6 static routes", explanation: "Static routes explicitly define a destination and next hop or exit interface; default routes provide a path for otherwise unmatched destinations.", example: "A default route pointing to the upstream router forwards unknown destinations toward the internet." },
      { id: "ospf", title: "Single-area OSPFv2", explanation: "OSPF is a link-state routing protocol. Routers form neighbor relationships and share topology information to calculate routes.", example: "Two routers on the same OSPF-enabled link can become neighbors and advertise their connected networks." },
      { id: "first-hop-redundancy", title: "First-hop redundancy", explanation: "First-hop redundancy protocols let multiple routers provide a resilient virtual default gateway to hosts.", example: "If the active gateway fails, a standby router can take over the virtual gateway address." }
    ]
  },
  {
    id: "ip-services",
    title: "IP Services",
    weight: 10,
    color: "#26A58A",
    icon: "cloud-outline",
    topics: [
      { id: "nat", title: "Network Address Translation", explanation: "NAT translates IP addresses as packets cross a network boundary, commonly allowing private-addressed hosts to reach external networks.", example: "A gateway translates an internal source address to an outside address for an internet-bound connection." },
      { id: "ntp", title: "Network Time Protocol", explanation: "NTP synchronizes device clocks so timestamps are consistent across systems.", example: "Matching router and server clocks makes it easier to correlate events in their logs." },
      { id: "dhcp-dns", title: "DHCP and DNS", explanation: "DHCP provides network configuration to clients; DNS translates domain names into records such as IP addresses.", example: "A client receives its address by DHCP and then queries DNS to resolve a website name." },
      { id: "monitoring", title: "SNMP and syslog", explanation: "SNMP supports monitoring and management; syslog transports device event messages to a collector.", example: "A syslog link-down message can help explain an alert from a network monitoring system." },
      { id: "qos", title: "Quality of Service", explanation: "QoS identifies and handles traffic differently through classification, marking, queuing, and related mechanisms.", example: "A network can prioritize latency-sensitive voice traffic over a bulk file transfer." },
      { id: "ssh", title: "Secure remote access", explanation: "SSH provides encrypted remote command-line access to network devices.", example: "Use SSH rather than an unencrypted management protocol when administering a router." },
      { id: "file-transfer", title: "Device file transfer", explanation: "Network file-transfer services are used to move configuration files, images, and other device files.", example: "Copy a configuration backup to a managed server before planned maintenance." }
    ]
  },
  {
    id: "security",
    title: "Security Fundamentals",
    weight: 15,
    color: "#E45D6A",
    icon: "shield-checkmark-outline",
    topics: [
      { id: "threats", title: "Threats and mitigation", explanation: "Security begins by identifying threats and vulnerabilities, then applying suitable mitigations and monitoring.", example: "Restricting an exposed management service reduces the chance of unauthorized access." },
      { id: "security-programs", title: "Policies and security programs", explanation: "Policies define acceptable use, access expectations, hardening practices, and user responsibilities.", example: "A least-privilege policy gives administrators only the access needed for their roles." },
      { id: "device-access", title: "Secure device access", explanation: "Network devices should use suitable authentication, protected credentials, and restricted management access.", example: "Allow device administration only from a designated management subnet." },
      { id: "acls", title: "Access control lists", explanation: "ACLs evaluate traffic against ordered permit and deny rules to control which packets are allowed.", example: "Permit a trusted subnet to reach a service while denying other source networks." },
      { id: "layer2-security", title: "Layer 2 security", explanation: "Layer 2 protections help control endpoint access and guard against unexpected or unsafe network behavior.", example: "Port security can limit the number of MAC addresses learned on a user-facing switch port." },
      { id: "aaa", title: "Authentication, authorization, and accounting", explanation: "AAA verifies identity, determines permitted actions, and records activity.", example: "Authentication confirms who logged in; authorization decides which commands they may execute." },
      { id: "vpn", title: "VPN concepts", explanation: "VPNs use secure tunnels to protect traffic across an untrusted network for remote access or site-to-site connectivity.", example: "A remote worker uses a VPN tunnel to reach internal company resources securely." },
      { id: "wireless-security", title: "Wireless security", explanation: "Wireless security controls how clients authenticate and protect data sent over radio links.", example: "A protected WLAN requires authentication instead of allowing anyone to join an open network." }
    ]
  },
  {
    id: "automation",
    title: "Automation and Programmability",
    weight: 10,
    color: "#477F9B",
    icon: "code-slash-outline",
    topics: [
      { id: "automation", title: "Network automation", explanation: "Automation applies repeatable operations to network devices, reducing repetitive manual work and configuration drift.", example: "A script can apply the same approved configuration to several switches." },
      { id: "controllers", title: "Controllers and software-defined networking", explanation: "A controller provides centralized visibility or policy management across network infrastructure.", example: "Compare setting policy separately on many devices with defining it centrally." },
      { id: "ai-ml", title: "AI and machine learning in networking", explanation: "AI and machine learning can help analyze network telemetry and highlight patterns or anomalies.", example: "An operations tool may flag traffic behavior that differs from the normal baseline." },
      { id: "rest-apis", title: "REST APIs", explanation: "REST APIs expose resources through requests and responses, commonly using HTTP methods and structured data.", example: "A client sends a GET request to retrieve interface status from a network-management API." },
      { id: "json", title: "JSON data", explanation: "JSON represents structured data using objects, arrays, keys, and values.", example: "An API response might contain an interface name and an operational status in a JSON object." },
      { id: "config-tools", title: "Configuration-management tools", explanation: "Tools such as Ansible and Terraform help define, apply, and repeat infrastructure changes.", example: "A playbook can apply a consistent intended configuration across multiple devices." },
      { id: "dna-center", title: "Cisco DNA Center and SD-Access", explanation: "Cisco DNA Center supports centralized network management; SD-Access uses software-defined approaches to apply network policy.", example: "A centrally managed access policy can be applied consistently across a managed campus." }
    ]
  }
];

export const allDomains: Domain[] = [...curriculum, ...ccnpCurriculum];

export const domainsForTrack = (track: "CCNA" | "CCNP Enterprise") =>
  track === "CCNA" ? curriculum : ccnpCurriculum;

export const allTopics = allDomains.flatMap((domain) =>
  domain.topics.map((topic) => ({
    ...topic,
    domainId: domain.id,
    domainTitle: domain.title,
    domainColor: domain.color,
    track: domain.exam === "ENCOR" || domain.exam === "ENARSI" ? "CCNP Enterprise" as const : "CCNA" as const,
    exam: domain.exam ?? "CCNA" as const
  }))
);

export const topicById = (id: string) => allTopics.find((topic) => topic.id === id);
