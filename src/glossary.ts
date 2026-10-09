export type GlossaryEntry = {
  term: string;
  definition: string;
  domain: string;
};

export const glossary: GlossaryEntry[] = [
  { term: "ACL", definition: "An ordered list of permit and deny rules used to filter network traffic.", domain: "Security" },
  { term: "Administrative distance", definition: "A local router preference used to select between routes learned from different sources.", domain: "IP Connectivity" },
  { term: "ARP", definition: "Address Resolution Protocol maps an IPv4 address to a local-link MAC address.", domain: "Network Fundamentals" },
  { term: "Broadcast domain", definition: "The Layer 2 network area in which a broadcast frame is forwarded; each VLAN is a separate broadcast domain.", domain: "Network Access" },
  { term: "Default gateway", definition: "The router address a host uses to send traffic to destinations outside its local subnet.", domain: "Network Fundamentals" },
  { term: "DHCP", definition: "Dynamic Host Configuration Protocol automatically provides hosts with IP settings such as address, mask, gateway, and DNS.", domain: "IP Services" },
  { term: "DNS", definition: "Domain Name System resolves names to records, commonly mapping host names to IP addresses.", domain: "IP Services" },
  { term: "EtherChannel", definition: "A logical link made by bundling multiple physical Ethernet links.", domain: "Network Access" },
  { term: "FHRP", definition: "A first-hop redundancy protocol provides hosts with a resilient virtual default gateway.", domain: "IP Connectivity" },
  { term: "IPv4", definition: "A 32-bit network-layer addressing system commonly written as four decimal octets.", domain: "Network Fundamentals" },
  { term: "IPv6", definition: "A 128-bit network-layer addressing system written in hexadecimal and separated by colons.", domain: "Network Fundamentals" },
  { term: "LACP", definition: "Link Aggregation Control Protocol dynamically negotiates an EtherChannel bundle.", domain: "Network Access" },
  { term: "Longest-prefix match", definition: "A router forwards a packet using the matching route with the most specific, longest network prefix.", domain: "IP Connectivity" },
  { term: "MAC address", definition: "A link-layer identifier used to deliver Ethernet frames on a local network.", domain: "Network Fundamentals" },
  { term: "NAT", definition: "Network Address Translation changes IP address information as traffic crosses a network boundary.", domain: "IP Services" },
  { term: "Native VLAN", definition: "The VLAN whose traffic is sent untagged on an IEEE 802.1Q trunk by default.", domain: "Network Access" },
  { term: "NTP", definition: "Network Time Protocol synchronizes clocks across networked systems.", domain: "IP Services" },
  { term: "OSPF", definition: "Open Shortest Path First is a link-state routing protocol that calculates routes from shared topology information.", domain: "IP Connectivity" },
  { term: "QoS", definition: "Quality of Service classifies and handles traffic to manage congestion and service needs.", domain: "IP Services" },
  { term: "Router", definition: "A Layer 3 device that forwards packets between IP networks using a routing table.", domain: "Network Fundamentals" },
  { term: "Spanning Tree", definition: "A family of Layer 2 protocols that prevents switching loops while retaining redundant paths.", domain: "Network Access" },
  { term: "SSH", definition: "Secure Shell provides encrypted remote command-line access to a device.", domain: "IP Services" },
  { term: "Subnet mask", definition: "An IPv4 bit mask that identifies which address bits represent the network prefix.", domain: "Network Fundamentals" },
  { term: "TCP", definition: "A connection-oriented transport protocol that supports ordered, reliable delivery.", domain: "Network Fundamentals" },
  { term: "Trunk", definition: "A switch link that carries traffic for multiple VLANs, typically using IEEE 802.1Q tags.", domain: "Network Access" },
  { term: "UDP", definition: "A connectionless transport protocol with low overhead and no built-in retransmission or sequencing.", domain: "Network Fundamentals" },
  { term: "VLAN", definition: "A logical Layer 2 segmentation that creates a separate broadcast domain on switched infrastructure.", domain: "Network Access" },
  { term: "VPN", definition: "A virtual private network uses a protected tunnel to carry traffic across an untrusted network.", domain: "Security" },
];
