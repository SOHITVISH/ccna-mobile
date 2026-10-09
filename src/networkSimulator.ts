export type DeviceKind = "switch" | "router" | "firewall";
export type DeviceProfile = {
  id: string;
  label: string;
  model: string;
  kind: DeviceKind;
  cli: string;
};
export type NetworkInterface = {
  name: string;
  address: string;
  mask: string;
  up: boolean;
  mode: "access" | "trunk" | "routed";
  vlan: number;
  vlans: number[];
  nameif: string;
  securityLevel: number;
  description: string;
  nativeVlan: number;
  channelGroup?: string;
  edgePort: boolean;
  bpduGuard: boolean;
  attributes: string[];
};
export type AclRule = { name: string; action: "permit" | "deny"; protocol: string; source: string; destination: string; port?: string };
export type NetworkDevice = {
  id: string;
  profileId: string;
  model: string;
  kind: DeviceKind;
  cli: string;
  hostname: string;
  mode: "user" | "privileged" | "config" | "interface" | "router" | "acl" | "policy";
  activeInterface?: string;
  ospfProcess?: string;
  activeOspfProcess?: string;
  activeProtocol?: string;
  activeAcl?: string;
  activeAclMode?: "standard" | "extended";
  activeRouteMap?: string;
  ospfNetworks: string[];
  routingConfig: string[];
  policyConfig: string[];
  securityConfig: string[];
  interfaces: NetworkInterface[];
  vlans: number[];
  staticRoutes: string[];
  aclRules: AclRule[];
  accessGroups: string[];
};

export const deviceProfiles: DeviceProfile[] = [
  { id: "catalyst-access", label: "Access switch", model: "Catalyst 9300 · IOS XE", kind: "switch", cli: "IOS XE" },
  { id: "catalyst-core", label: "Layer 3 core switch", model: "Catalyst 9500 · IOS XE", kind: "switch", cli: "IOS XE" },
  { id: "catalyst-2960", label: "Classic access switch", model: "Catalyst 2960 · IOS", kind: "switch", cli: "IOS" },
  { id: "nexus", label: "Data-center switch", model: "Nexus 9000 · NX-OS subset", kind: "switch", cli: "NX-OS subset" },
  { id: "isr", label: "Branch router", model: "ISR 4331 · IOS XE", kind: "router", cli: "IOS XE" },
  { id: "asr", label: "WAN router", model: "ASR 1001-X · IOS XE", kind: "router", cli: "IOS XE" },
  { id: "asa", label: "Stateful firewall", model: "ASA 5506-X · ASA subset", kind: "firewall", cli: "ASA subset" },
  { id: "ftd", label: "Next-generation firewall", model: "Secure Firewall · FTD concepts", kind: "firewall", cli: "FTD concepts" }
];

function makeInterface(name: string, settings: Partial<NetworkInterface> = {}): NetworkInterface {
  return {
    name, address: "unassigned", mask: "", up: false, mode: "routed", vlan: 1, vlans: [], nameif: "", securityLevel: 0, description: "",
    nativeVlan: 1, edgePort: false, bpduGuard: false, attributes: [],
    ...settings
  };
}

export function createLabDevices(): NetworkDevice[] {
  return [
    {
      id: "access", profileId: "catalyst-access", model: "Catalyst 9300 · IOS XE", kind: "switch", cli: "IOS XE", hostname: "SW-ACCESS", mode: "user", ospfNetworks: [], routingConfig: [], policyConfig: [], securityConfig: [], vlans: [1, 10, 20],
      interfaces: [
        makeInterface("GigabitEthernet1/0/1", { up: true, mode: "access", vlan: 10, description: "Staff workstation" }),
        makeInterface("GigabitEthernet1/0/48", { up: true, mode: "trunk", vlans: [10, 20], description: "Uplink to core" })
      ], staticRoutes: [], aclRules: [], accessGroups: []
    },
    {
      id: "core", profileId: "catalyst-core", model: "Catalyst 9500 · IOS XE", kind: "switch", cli: "IOS XE", hostname: "SW-CORE", mode: "user", ospfNetworks: [], routingConfig: [], policyConfig: [], securityConfig: [], vlans: [10, 20],
      interfaces: [
        makeInterface("Vlan10", { address: "10.10.10.1", mask: "255.255.255.0", up: true, mode: "routed", vlan: 10 }),
        makeInterface("GigabitEthernet1/0/1", { address: "172.16.0.1", mask: "255.255.255.252", up: true })
      ], staticRoutes: [], aclRules: [], accessGroups: []
    },
    {
      id: "router", profileId: "isr", model: "ISR 4331 · IOS XE", kind: "router", cli: "IOS XE", hostname: "R-BRANCH", mode: "user", ospfNetworks: [], routingConfig: [], policyConfig: [], securityConfig: [],
      interfaces: [
        makeInterface("GigabitEthernet0/0/0", { address: "172.16.0.2", mask: "255.255.255.252", up: true }),
        makeInterface("GigabitEthernet0/0/1", { address: "198.51.100.1", mask: "255.255.255.252", up: true })
      ], vlans: [], staticRoutes: [], aclRules: [], accessGroups: []
    },
    {
      id: "firewall", profileId: "asa", model: "ASA 5506-X · ASA subset", kind: "firewall", cli: "ASA subset", hostname: "FW-EDGE", mode: "user", ospfNetworks: [], routingConfig: [], policyConfig: [], securityConfig: [],
      interfaces: [
        makeInterface("GigabitEthernet1/1", { address: "198.51.100.2", mask: "255.255.255.252", up: true, nameif: "outside", securityLevel: 0 }),
        makeInterface("GigabitEthernet1/2", { address: "10.255.0.1", mask: "255.255.255.0", up: true, nameif: "inside", securityLevel: 100 })
      ], vlans: [], staticRoutes: [], aclRules: [], accessGroups: []
    }
  ];
}

export function createDevice(profile: DeviceProfile, ordinal: number): NetworkDevice {
  const slug = profile.id.replace(/[^a-z0-9-]/gi, "");
  const hostname = `${profile.kind === "switch" ? "SW" : profile.kind === "router" ? "R" : "FW"}-${slug.toUpperCase()}-${ordinal}`;
  const interfaceName = profile.kind === "switch" ? "GigabitEthernet1/0/1" : "GigabitEthernet0/0";
  return {
    id: `${slug}-${ordinal}`, profileId: profile.id, model: profile.model, kind: profile.kind, cli: profile.cli, hostname, mode: "user",
    ospfNetworks: [], routingConfig: [], policyConfig: [], securityConfig: [], interfaces: [makeInterface(interfaceName)], vlans: [1], staticRoutes: [], aclRules: [], accessGroups: []
  };
}

function ipv4Number(value: string): number | undefined {
  const fields = value.split(".");
  if (fields.length !== 4 || fields.some((field) => !/^\d{1,3}$/.test(field) || Number(field) > 255)) return undefined;
  return fields.reduce((number, field) => ((number << 8) | Number(field)) >>> 0, 0);
}

function sameSubnet(addressA: string, maskA: string, addressB: string, maskB: string): boolean {
  const ipA = ipv4Number(addressA);
  const ipB = ipv4Number(addressB);
  const mask = ipv4Number(maskA);
  const otherMask = ipv4Number(maskB);
  return ipA !== undefined && ipB !== undefined && mask !== undefined && mask === otherMask && (ipA & mask) === (ipB & mask);
}

export function commandPrompt(device: NetworkDevice): string {
  if (device.mode === "config") return `${device.hostname}(config)#`;
  if (device.mode === "interface") return `${device.hostname}(config-if)#`;
  if (device.mode === "router") return `${device.hostname}(config-router)#`;
  if (device.mode === "acl") return `${device.hostname}(config-${device.activeAclMode === "standard" ? "std" : "ext"}-nacl)#`;
  if (device.mode === "policy") return `${device.hostname}(config-route-map)#`;
  return `${device.hostname}${device.mode === "privileged" ? "#" : ">"}`;
}

function showRoutes(device: NetworkDevice, peers: NetworkDevice[]): string {
  const routes = device.interfaces
    .filter((item) => item.up && item.address !== "unassigned")
    .map((item) => `C    ${item.address} ${item.mask} is directly connected, ${item.name}`)
    .concat(device.staticRoutes.map((route) => `S    ${route}`));
  const ospf = peers.filter((peer) => peer.ospfProcess && device.ospfProcess).flatMap((peer) => peer.interfaces
    .filter((peerInterface) => peerInterface.up && peerInterface.address !== "unassigned" && ospfEnabled(peer, peerInterface) && device.interfaces.some((local) =>
      local.up && local.address !== "unassigned" && ospfEnabled(device, local) && sameSubnet(local.address, local.mask, peerInterface.address, peerInterface.mask)
    ))
    .map((item) => `O    ${item.address} ${item.mask} via ${peer.hostname} (${item.name})`));
  return routes.concat(ospf).length ? `Codes: C - connected, S - static, O - simulated OSPF\n${routes.concat(ospf).join("\n")}` : "No routes installed.";
}

function showRunningConfig(device: NetworkDevice): string {
  const lines = [`hostname ${device.hostname}`, "!", ...device.vlans.filter((vlan) => vlan !== 1).map((vlan) => `vlan ${vlan}`)];
  for (const item of device.interfaces) {
    lines.push("!", `interface ${item.name}`);
    if (item.description) lines.push(` description ${item.description}`);
    if (item.nameif) lines.push(` nameif ${item.nameif}`, ` security-level ${item.securityLevel}`);
    if (item.mode === "access") lines.push(" switchport mode access", ` switchport access vlan ${item.vlan}`);
    if (item.mode === "trunk") lines.push(" switchport mode trunk", ` switchport trunk native vlan ${item.nativeVlan}`, ` switchport trunk allowed vlan ${item.vlans.join(",")}`);
    if (item.address !== "unassigned") lines.push(` ip address ${item.address} ${item.mask}`);
    if (item.channelGroup) lines.push(` channel-group ${item.channelGroup} mode active`);
    if (item.edgePort) lines.push(" spanning-tree portfast");
    if (item.bpduGuard) lines.push(" spanning-tree bpduguard enable");
    lines.push(...item.attributes.map((attribute) => ` ${attribute}`));
    lines.push(item.up ? " no shutdown" : " shutdown");
  }
  lines.push(...device.routingConfig);
  lines.push(...device.policyConfig);
  lines.push(...device.securityConfig);
  lines.push(...device.staticRoutes.map((route) => `ip route ${route}`));
  lines.push(...device.aclRules.map((rule) => `access-list ${rule.name} extended ${rule.action} ${rule.protocol} ${rule.source} ${rule.destination}${rule.port ? ` eq ${rule.port}` : ""}`));
  lines.push(...device.accessGroups.map((group) => `access-group ${group}`));
  return lines.join("\n");
}

function showBgpSummary(device: NetworkDevice, peers: NetworkDevice[]): string {
  const asMatch = device.routingConfig.find((line) => /^router bgp\s+\d+$/i.test(line));
  const localAs = asMatch?.match(/\d+$/)?.[0];
  if (!localAs) return "BGP is not configured.";
  const configuredPeers = device.routingConfig.flatMap((line) => {
    const match = line.match(/^neighbor\s+(\d{1,3}(?:\.\d{1,3}){3})\s+remote-as\s+(\d+)$/i);
    return match ? [{ address: match[1], remoteAs: match[2] }] : [];
  });
  const rows = configuredPeers.map(({ address, remoteAs }) => {
    const remoteDevice = peers.find((peer) => peer.interfaces.some((item) => item.up && item.address === address));
    const localAddresses = device.interfaces.filter((item) => item.up && item.address !== "unassigned" && remoteDevice?.interfaces.some((remote) =>
      remote.up && sameSubnet(item.address, item.mask, remote.address, remote.mask)
    )).map((item) => item.address);
    const reciprocal = remoteDevice?.routingConfig.some((line) =>
      new RegExp(`^router bgp ${remoteAs}$`, "i").test(line)
    ) && localAddresses.some((localAddress) => remoteDevice.routingConfig.includes(`neighbor ${localAddress} remote-as ${localAs}`));
    return `${address.padEnd(18)} ${remoteAs.padEnd(8)} ${reciprocal ? "Established (simulated reciprocal configuration)" : "Idle (peer/interface/reciprocal configuration not found)"}`;
  });
  return `BGP router identifier ${device.hostname}, local AS ${localAs}\nNeighbor          AS       State\n${rows.join("\n") || "No BGP neighbors configured."}\nProtocol timers, route selection, and packet exchange are not emulated.`;
}

function showEtherChannels(device: NetworkDevice): string {
  const members = device.interfaces.filter((item) => item.channelGroup);
  if (!members.length) return "No EtherChannel members configured.";
  const groups = [...new Set(members.map((item) => item.channelGroup))];
  return `Group  Port-channel  Protocol  Members\n${groups.map((group) => {
    const groupMembers = members.filter((item) => item.channelGroup === group).map((item) => item.name).join(", ");
    return `${group?.padEnd(7)} Po${group?.padEnd(13)} LACP      ${groupMembers}`;
  }).join("\n")}\nLACP state negotiation is represented by configuration only.`;
}

function parseAclRule(name: string, action: string, protocol: string, source: string, destination: string, port?: string): AclRule | undefined {
  if (!["permit", "deny"].includes(action.toLowerCase()) || !["ip", "tcp", "udp", "icmp"].includes(protocol.toLowerCase())) return undefined;
  if ([source, destination].some((address) => address.toLowerCase() !== "any" && ipv4Number(address) === undefined)) return undefined;
  if (port && (!/^\d{1,5}$/.test(port) || Number(port) > 65535)) return undefined;
  return { name, action: action.toLowerCase() as "permit" | "deny", protocol: protocol.toLowerCase(), source, destination, port };
}

function ospfEnabled(device: NetworkDevice, item: NetworkInterface): boolean {
  if (!device.ospfProcess || item.address === "unassigned") return false;
  return device.ospfNetworks.some((network) => {
    const match = network.match(/^(\S+)\s+(\S+)\s+area\s+(\S+)$/);
    if (!match) return false;
    const address = ipv4Number(match[1]);
    const wildcard = ipv4Number(match[2]);
    const current = ipv4Number(item.address);
    return address !== undefined && wildcard !== undefined && current !== undefined && ((address ^ current) & (~wildcard >>> 0)) === 0;
  });
}

function showOspfNeighbors(device: NetworkDevice, peers: NetworkDevice[]): string {
  if (!device.ospfProcess) return "OSPF is not configured.";
  const neighbors = peers.flatMap((peer) => {
    if (!peer.ospfProcess) return [];
    return device.interfaces.flatMap((local) => peer.interfaces
      .filter((remote) =>
        local.up && remote.up &&
        sameSubnet(local.address, local.mask, remote.address, remote.mask) &&
        ospfEnabled(device, local) && ospfEnabled(peer, remote)
      )
      .map((remote) => `FULL/ -  ${remote.address}  ${peer.hostname}  ${local.name}`));
  });
  return neighbors.length ? `Neighbor ID       State       Address        Interface\n${neighbors.join("\n")}` : "No matching simulated OSPF neighbors.";
}

function cliError(command: string, device: NetworkDevice): string {
  const firewallNote = device.kind === "firewall" ? "ASA subset supports interface addressing, nameif/security-level, access-list, access-group, show, and test commands." : "Supported commands are listed in the lab help panel.";
  return `% Invalid or unsupported ${device.cli} command: "${command}". ${firewallNote}`;
}

export function executeCommand(device: NetworkDevice, rawCommand: string, allDevices: NetworkDevice[]): { device: NetworkDevice; output: string } {
  const command = rawCommand.trim();
  const normalized = command.toLowerCase();
  const peers = allDevices.filter((item) => item.id !== device.id);
  if (!command) return { device, output: "" };
  if (normalized === "help" || normalized === "?") {
    return { device, output: "Common commands: enable, configure terminal, interface <name>, vlan <id>, ip address <IPv4> <mask>, switchport mode access|trunk, switchport access vlan <id>, ip route <network> <mask> <next-hop>, router ospf|bgp|eigrp <id>, network <prefix>, neighbor <IPv4> remote-as <ASN>, ip access-list extended <name>, permit|deny <protocol> <source> <destination>, route-map <name> permit <seq>, show running-config, show ip route, show ip ospf neighbor, show ip bgp summary, show vlan brief, show interfaces trunk, show spanning-tree, show etherchannel summary, show access-lists, ping <IPv4>, test tcp <source-ip> <destination-ip> <port>, exit, end." };
  }
  if (/^show version$/i.test(command)) return { device, output: `${device.model}\nSimulated lab device · ${device.cli}\nPacketPath command subset; not a Cisco operating-system image.` };
  if (/^show running-config$|^show run$/i.test(command)) return { device, output: showRunningConfig(device) };
  if (/^show ip interface brief$|^show interfaces? status$/i.test(command)) {
    const rows = device.interfaces.map((item) => `${item.name.padEnd(24)} ${item.address.padEnd(16)} ${item.up ? "up" : "administratively down"} ${item.up ? "up" : "down"}`);
    return { device, output: `Interface                IP-Address       Status                 Protocol\n${rows.join("\n")}` };
  }
  if (/^show ip route(?: .*)?$|^show route$/i.test(command)) return { device, output: showRoutes(device, peers) };
  if (/^show ip ospf neighbor$/i.test(command)) return { device, output: showOspfNeighbors(device, peers) };
  if (/^show ip ospf database(?: .*)?$/i.test(command)) return { device, output: device.ospfProcess ? `OSPF ${device.ospfProcess} configured networks:\n${device.ospfNetworks.map((network) => `Network ${network}`).join("\n") || "No networks enabled."}\nFull LSDB flooding and SPF are not emulated.` : "OSPF is not configured." };
  if (/^show ip bgp summary$/i.test(command)) return { device, output: showBgpSummary(device, peers) };
  if (/^show ip bgp(?: .*)?$/i.test(command)) return { device, output: device.routingConfig.some((line) => /^router bgp\s+/i.test(line)) ? `BGP configuration:\n${device.routingConfig.filter((line) => /^router bgp\s+|^neighbor\s+|^network\s+|^redistribute\s+/i.test(line)).join("\n") || "No BGP routes configured."}\nFull BGP best-path selection and route exchange are not emulated.` : "BGP is not configured." };
  if (/^show ip eigrp neighbors?$/i.test(command)) return { device, output: device.routingConfig.some((line) => /^router eigrp\s+/i.test(line)) ? "EIGRP configuration is present; DUAL neighbor formation and route convergence are not emulated." : "EIGRP is not configured." };
  if (/^show ip eigrp topology(?: .*)?$/i.test(command)) return { device, output: device.routingConfig.some((line) => /^router eigrp\s+/i.test(line)) ? `EIGRP configured networks:\n${device.routingConfig.filter((line) => /^ network\s+/i.test(line)).join("\n") || "No network statements configured."}\nDUAL topology state is not emulated.` : "EIGRP is not configured." };
  if (/^show vlan(?: brief)?$/i.test(command)) {
    const rows = [...new Set(device.vlans)].sort((a, b) => a - b).map((vlan) => {
      const ports = device.interfaces.filter((item) => item.mode === "access" && item.vlan === vlan).map((item) => item.name).join(",");
      return `${vlan.toString().padEnd(8)} VLAN${vlan.toString().padEnd(16)} active     ${ports || "-"}`;
    });
    return { device, output: `VLAN    Name             Status     Ports\n${rows.join("\n") || "No VLANs configured."}` };
  }
  if (/^show interfaces trunk$/i.test(command)) {
    const trunks = device.interfaces.filter((item) => item.mode === "trunk");
    return { device, output: trunks.length ? `Port                 Mode     Encapsulation  Status     Native VLAN  Allowed VLANs\n${trunks.map((item) => `${item.name.padEnd(21)} on       802.1q         trunking   ${String(item.nativeVlan).padEnd(12)} ${item.vlans.join(",")}`).join("\n")}` : "No trunk interfaces configured." };
  }
  if (/^show spanning-tree(?: .*)?$/i.test(command)) {
    return { device, output: device.kind !== "switch" ? "% Spanning tree is available on switch profiles only." : `Simulated STP view\nBridge: ${device.hostname}\nVlans: ${device.vlans.join(", ")}\nEdge access ports should use edge mode and BPDU Guard.\nThis lab models VLAN/port state but not a full STP election.` };
  }
  if (/^show etherchannel summary$/i.test(command)) {
    return { device, output: showEtherChannels(device) };
  }
  if (/^show access-lists?$|^show access-list(?: .*)?$/i.test(command)) {
    return { device, output: device.aclRules.length ? device.aclRules.map((rule, index) => `access-list ${rule.name} line ${index + 1} extended ${rule.action} ${rule.protocol} ${rule.source} ${rule.destination}${rule.port ? ` eq ${rule.port}` : ""}`).join("\n") : "No access-list rules configured." };
  }
  if (/^show logging$/i.test(command)) return { device, output: "Simulated local event log is empty. Configuration changes are shown in the running configuration." };
  if (/^show crypto (?:ikev2|ipsec) sa$/i.test(command)) return { device, output: "No negotiated VPN security associations are emulated. This lab does not perform IKE/IPsec cryptographic negotiation." };
  if (/^show ip sla statistics$/i.test(command)) return { device, output: device.policyConfig.some((line) => /^ip sla\s+/i.test(line)) ? "IP SLA configuration is stored; probe scheduling and measured results are not emulated." : "No IP SLA operation configured." };
  if (/^show track$/i.test(command)) return { device, output: device.policyConfig.filter((line) => /^track\s+/i.test(line)).join("\n") || "No tracking objects configured." };
  if (/^show mac address-table(?: .*)?$/i.test(command)) {
    const entries = device.interfaces.filter((item) => item.mode === "access").map((item) => `dynamic  0011.2233.${String(item.vlan).padStart(4, "0")}  ${item.vlan}  ${item.name}`);
    return { device, output: `VLAN  MAC Address       Type     Port\n${entries.join("\n") || "No simulated learned MAC entries."}\nMAC learning is represented by configured access-port state only.` };
  }
  if (/^write memory$|^copy running-config startup-config$|^wr mem$/i.test(command)) return { device, output: "Configuration saved in this in-memory lab session." };
  const ping = command.match(/^ping\s+(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (ping) {
    const target = ping[1];
    const connected = device.interfaces.some((local) => local.up && local.address !== "unassigned" && peers.some((peer) =>
      peer.interfaces.some((remote) => remote.up && remote.address === target && sameSubnet(local.address, local.mask, remote.address, remote.mask))
    ));
    const ownAddress = device.interfaces.some((item) => item.up && item.address === target);
    return { device, output: ownAddress || connected ? `!!!!\nSuccess rate is 100 percent (4/4), simulated reachability to ${target}.` : `....\nSuccess rate is 0 percent (0/4), simulated reachability to ${target}.\nCheck addressing, interface state, routing, and policy.` };
  }
  const tcpTest = command.match(/^test\s+tcp\s+(\d{1,3}(?:\.\d{1,3}){3})\s+(\d{1,3}(?:\.\d{1,3}){3})\s+(\d{1,5})$/i);
  if (tcpTest) {
    const [, source, destination, port] = tcpTest;
    if (device.kind !== "firewall") return { device, output: "% The TCP policy test is available on firewall profiles only." };
    const bound = device.accessGroups.find((group) => /^access-group\s+\S+\s+in\b/i.test(group));
    if (!bound) return { device, output: "No inbound access-group ACL is bound. Configure a policy before testing; default security-level behavior is not fully simulated." };
    const listName = bound?.match(/access-group\s+(\S+)/i)?.[1];
    const rule = device.aclRules.find((item) => item.name === listName && (item.protocol === "ip" || item.protocol === "tcp") && (item.source === "any" || item.source === source) && (item.destination === "any" || item.destination === destination) && (!item.port || item.port === port));
    const permitted = rule ? rule.action === "permit" : false;
    return { device, output: `${source} -> ${destination}:tcp/${port}: ${permitted ? "PERMITTED" : "DENIED"}${rule ? ` by ${rule.name} (${rule.action})` : " by implicit deny"}.\nStateful return handling and full firewall inspection are not emulated.` };
  }
  if (normalized === "enable") return { device: { ...device, mode: "privileged" }, output: "Privileged EXEC enabled." };
  if (/^configure terminal$|^conf t$/i.test(command)) {
    if (device.mode === "user") return { device, output: "% Enter privileged mode first with enable." };
    return { device: { ...device, mode: "config", activeInterface: undefined, activeOspfProcess: undefined, activeProtocol: undefined, activeAcl: undefined, activeRouteMap: undefined }, output: "Enter configuration commands, one per line. End with CNTL/Z." };
  }
  if (normalized === "end") return { device: { ...device, mode: "privileged", activeInterface: undefined, activeOspfProcess: undefined, activeProtocol: undefined, activeAcl: undefined, activeRouteMap: undefined }, output: "" };
  if (normalized === "exit") {
    const mode = device.mode === "interface" || device.mode === "router" ? "config" : device.mode === "config" ? "privileged" : "user";
    if (device.mode === "acl" || device.mode === "policy") return { device: { ...device, mode: "config", activeAcl: undefined, activeAclMode: undefined, activeRouteMap: undefined }, output: "" };
    return { device: { ...device, mode, activeInterface: undefined, activeOspfProcess: undefined, activeProtocol: undefined }, output: "" };
  }
  if (device.mode === "config" && normalized.startsWith("hostname ")) {
    const hostname = command.slice(9).trim().replace(/[^a-z0-9-]/gi, "").slice(0, 32);
    return hostname ? { device: { ...device, hostname }, output: `Hostname set to ${hostname}.` } : { device, output: cliError(command, device) };
  }
  if (device.mode === "config" && normalized.startsWith("interface ")) {
    const name = command.slice(10).trim();
    const found = device.interfaces.some((item) => item.name.toLowerCase() === name.toLowerCase());
    const interfaceRecord = found ? device.interfaces : [...device.interfaces, makeInterface(name)];
    return { device: { ...device, interfaces: interfaceRecord, activeInterface: name, mode: "interface" }, output: `Selected interface ${name}.` };
  }
  if (device.mode === "config" && normalized.startsWith("vlan ")) {
    if (device.kind !== "switch") return { device, output: "% VLAN configuration is available on switch profiles only." };
    const vlan = Number(command.slice(5).trim());
    if (!Number.isInteger(vlan) || vlan < 1 || vlan > 4094) return { device, output: "% VLAN ID must be an integer from 1 to 4094." };
    return { device: { ...device, vlans: [...new Set([...device.vlans, vlan])] }, output: `VLAN ${vlan} created.` };
  }
  if (device.mode === "config" && /^router\s+(ospf|bgp|eigrp)\s+\S+$/i.test(command)) {
    const [, protocol, process] = command.trim().match(/^router\s+(ospf|bgp|eigrp)\s+(\S+)$/i) ?? [];
    if (!protocol || !process) return { device, output: cliError(command, device) };
    const canonical = `router ${protocol.toLowerCase()} ${process}`;
    const routingConfig = device.routingConfig.includes(canonical) ? device.routingConfig : [...device.routingConfig, canonical];
    const ospf = protocol.toLowerCase() === "ospf" ? process : device.ospfProcess;
    return {
      device: { ...device, mode: "router", activeProtocol: canonical, activeOspfProcess: ospf === process ? process : undefined, ospfProcess: ospf, routingConfig },
      output: `Entered ${protocol.toUpperCase()} ${process} configuration.`
    };
  }
  if (device.mode === "router" && device.activeProtocol && normalized.startsWith("network ")) {
    const value = command.slice(8).trim();
    if (/^router ospf\s+/i.test(device.activeProtocol)) {
      if (!/^\d{1,3}(?:\.\d{1,3}){3}\s+\d{1,3}(?:\.\d{1,3}){3}\s+area\s+[\w.]+$/i.test(value)) return { device, output: "% OSPF network syntax: network <IPv4> <wildcard-mask> area <area-id>." };
      const routingConfig = [...device.routingConfig, ` network ${value}`];
      return { device: { ...device, ospfNetworks: [...device.ospfNetworks, value], routingConfig }, output: `OSPF network ${value} added.` };
    }
    if (/^router bgp\s+/i.test(device.activeProtocol) && !/^(\d{1,3}\.){3}\d{1,3}\s+mask\s+(\d{1,3}\.){3}\d{1,3}$/i.test(value)) {
      return { device, output: "% BGP network syntax in this lab: network <prefix> mask <IPv4-mask>." };
    }
    if (/^router eigrp\s+/i.test(device.activeProtocol) && !/^(\d{1,3}\.){3}\d{1,3}(?:\s+(\d{1,3}\.){3}\d{1,3})?$/.test(value)) {
      return { device, output: "% EIGRP network syntax: network <IPv4> [wildcard-mask]." };
    }
    return { device: { ...device, routingConfig: [...device.routingConfig, ` network ${value}`] }, output: `Network statement added to ${device.activeProtocol}.` };
  }
  if (device.mode === "router" && /^neighbor\s+\S+\s+remote-as\s+\d+$/i.test(command)) {
    const canonical = command.trim().replace(/\s+/g, " ");
    return { device: { ...device, routingConfig: [...device.routingConfig, canonical] }, output: `${canonical} added; adjacency forms only when a reciprocal configured peer exists in this sandbox.` };
  }
  if (device.mode === "router" && /^(redistribute|passive-interface|default-information|maximum-paths|variance|timers|area|distance|bfd|no passive-interface)\s+/i.test(command)) {
    const canonical = command.trim().replace(/\s+/g, " ");
    return { device: { ...device, routingConfig: [...device.routingConfig, ` ${canonical}`] }, output: `Routing policy stored under ${device.activeProtocol}. Protocol behavior is not fully emulated.` };
  }
  if (device.mode === "config" && normalized.startsWith("ip route ")) {
    const route = command.slice(9).trim();
    const parts = route.split(/\s+/);
    if (parts.length !== 3 || parts.some((part) => ipv4Number(part) === undefined)) return { device, output: "% Static route syntax: ip route <network> <mask> <next-hop IPv4>." };
    return { device: { ...device, staticRoutes: [...device.staticRoutes, route] }, output: `Static route ${route} added.` };
  }
  if (device.mode === "config" && /^ip access-list\s+(standard|extended)\s+\S+$/i.test(command)) {
    const [, aclMode, aclName] = command.trim().match(/^ip access-list\s+(standard|extended)\s+(\S+)$/i) ?? [];
    if (!aclMode || !aclName) return { device, output: cliError(command, device) };
    return { device: { ...device, mode: "acl", activeAcl: aclName, activeAclMode: aclMode.toLowerCase() as "standard" | "extended" }, output: `Entered ${aclMode.toUpperCase()} ACL ${aclName}. Use permit/deny entries; exit to return to global configuration.` };
  }
  if (device.mode === "config" && /^ip prefix-list\s+/i.test(command)) {
    if (!/^ip prefix-list\s+\S+\s+(?:seq\s+\d+\s+)?(?:permit|deny)\s+\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}(?:\s+(?:le|ge)\s+\d{1,2})?$/i.test(command)) {
      return { device, output: "% Prefix-list syntax: ip prefix-list <name> [seq <n>] <permit|deny> <IPv4-prefix> [le|ge <length>]." };
    }
    return { device: { ...device, policyConfig: [...device.policyConfig, command.trim().replace(/\s+/g, " ")] }, output: "IPv4 prefix-list entry stored." };
  }
  if (device.mode === "config" && /^route-map\s+\S+\s+(?:permit|deny)\s+\d+$/i.test(command)) {
    const mapName = command.trim().split(/\s+/)[1];
    return { device: { ...device, mode: "policy", activeRouteMap: mapName, policyConfig: [...device.policyConfig, command.trim().replace(/\s+/g, " ")] }, output: `Entered route-map ${mapName}. Match/set policy lines are stored for review; route-map evaluation is not emulated.` };
  }
  if (device.mode === "policy" && /^(match|set)\s+/i.test(command)) {
    const canonical = command.trim().replace(/\s+/g, " ");
    return { device: { ...device, policyConfig: [...device.policyConfig, ` ${canonical}`] }, output: `Policy statement stored under route-map ${device.activeRouteMap ?? "unknown"}.` };
  }
  if (device.mode === "config" && /^access-list\s+\S+\s+/i.test(command)) {
    const match = command.match(/^access-list\s+(\S+)\s+(?:(?:extended|standard)\s+)?(permit|deny)\s+(?:(ip|tcp|udp|icmp)\s+)?(?:host\s+)?(\S+)(?:\s+(?:host\s+)?(\S+))?(?:\s+eq\s+(\S+))?$/i);
    if (!match) return { device, output: "% Numbered/named ACL syntax: access-list <id|name> [extended] <permit|deny> [protocol] [host] <source|any> [host] <destination|any> [eq <port>]." };
    const protocol = match[3] ?? (match[5] ? "ip" : "ip");
    const destination = match[5] ?? "any";
    const rule = parseAclRule(match[1], match[2], protocol, match[4], destination, match[6]);
    if (!rule) return { device, output: "% This teaching ACL subset accepts IPv4 host addresses or any, with optional TCP/UDP ports." };
    return { device: { ...device, aclRules: [...device.aclRules, rule] }, output: `Access-list ${rule.name} rule added.` };
  }
  if (device.mode === "config" && /^(?:ip dhcp snooping(?:\s+vlan\s+[\d,-]+)?|ip arp inspection vlan\s+[\d,-]+|spanning-tree vlan\s+\d+\s+root\s+(?:primary|secondary)|ntp server\s+\S+|logging host\s+\S+|snmp-server\s+.+|aaa new-model|crypto\s+.+|ip sla\s+\d+|track\s+\d+\s+.+)$/i.test(command)) {
    const canonical = command.trim().replace(/\s+/g, " ");
    return { device: { ...device, securityConfig: [...device.securityConfig, canonical], policyConfig: /^(?:ip sla|track)\s+/i.test(canonical) ? [...device.policyConfig, canonical] : device.policyConfig }, output: `Configuration stored: ${canonical}. Full protocol or service behavior is not emulated.` };
  }
  if (device.mode === "interface" && device.activeInterface) {
    const index = device.interfaces.findIndex((item) => item.name.toLowerCase() === device.activeInterface?.toLowerCase());
    if (index < 0) return { device, output: "% Selected interface no longer exists." };
    const current = device.interfaces[index];
    let updated: NetworkInterface | undefined;
    if (/^no shutdown$/i.test(command)) updated = { ...current, up: true };
    else if (/^shutdown$/i.test(command)) updated = { ...current, up: false };
    else if (/^description\s+/i.test(command)) updated = { ...current, description: command.replace(/^description\s+/i, "").trim() };
    else {
      const address = command.match(/^ip address\s+(\S+)\s+(\S+)$/i);
      const accessVlan = command.match(/^switchport access vlan\s+(\d+)$/i);
      const allowedVlans = command.match(/^switchport trunk allowed vlan\s+([\d, -]+)$/i);
      const nativeVlan = command.match(/^switchport trunk native vlan\s+(\d+)$/i);
      const channel = command.match(/^channel-group\s+(\d+)\s+mode\s+(active|passive|on)$/i);
      const nameif = command.match(/^nameif\s+(\S+)$/i);
      const security = command.match(/^security-level\s+(\d+)$/i);
      if (address && ipv4Number(address[1]) !== undefined && ipv4Number(address[2]) !== undefined) updated = { ...current, address: address[1], mask: address[2] };
      else if (/^switchport mode access$/i.test(command) && device.kind === "switch") updated = { ...current, mode: "access" };
      else if (/^switchport mode trunk$/i.test(command) && device.kind === "switch") updated = { ...current, mode: "trunk" };
      else if (/^no switchport$/i.test(command) && device.kind === "switch") updated = { ...current, mode: "routed" };
      else if (accessVlan && device.kind === "switch" && Number(accessVlan[1]) >= 1 && Number(accessVlan[1]) <= 4094) updated = { ...current, vlan: Number(accessVlan[1]), mode: "access" };
      else if (allowedVlans && device.kind === "switch" && allowedVlans[1].split(/[,\s]+/).filter(Boolean).every((vlan) => /^\d+$/.test(vlan) && Number(vlan) >= 1 && Number(vlan) <= 4094)) updated = { ...current, vlans: allowedVlans[1].split(/[,\s]+/).filter(Boolean).map(Number), mode: "trunk" };
      else if (nativeVlan && device.kind === "switch" && Number(nativeVlan[1]) >= 1 && Number(nativeVlan[1]) <= 4094) updated = { ...current, nativeVlan: Number(nativeVlan[1]), mode: "trunk" };
      else if (channel && device.kind === "switch") updated = { ...current, channelGroup: channel[1] };
      else if (/^spanning-tree portfast(?: edge)?$/i.test(command) && device.kind === "switch") updated = { ...current, edgePort: true };
      else if (/^spanning-tree bpduguard enable$/i.test(command) && device.kind === "switch") updated = { ...current, bpduGuard: true };
      else if (nameif && device.kind === "firewall") updated = { ...current, nameif: nameif[1] };
      else if (security && device.kind === "firewall" && Number(security[1]) <= 100) updated = { ...current, securityLevel: Number(security[1]) };
      else if (/^(?:ip helper-address\s+\S+|ip ospf\s+\d+\s+area\s+\S+|ipv6 address\s+\S+|ipv6 ospf\s+\S+\s+area\s+\S+|ip policy route-map\s+\S+|ip access-group\s+\S+\s+(?:in|out)|ip nat\s+(?:inside|outside)|standby\s+\d+\s+(?:ip|priority|preempt|track)\s+.+|ip dhcp snooping trust|spanning-tree guard root|ip verify unicast source reachable-via\s+(?:rx|any)|service-policy\s+(?:input|output)\s+\S+|bfd\s+\S+|tunnel\s+(?:source|destination)\s+\S+)$/i.test(command)) {
        updated = { ...current, attributes: [...current.attributes, command.trim().replace(/\s+/g, " ")] };
      }
      if (!updated) return { device, output: cliError(command, device) };
    }
    const interfaces = [...device.interfaces];
    interfaces[index] = updated;
    return { device: { ...device, interfaces }, output: "Interface configuration updated." };
  }
  if (device.mode === "acl" && device.activeAcl) {
    const match = command.match(/^(permit|deny)\s+(?:(ip|tcp|udp|icmp)\s+)?(?:host\s+)?(\S+)(?:\s+(?:host\s+)?(\S+))?(?:\s+eq\s+(\S+))?$/i);
    if (!match) return { device, output: "% ACL entry syntax: permit|deny [protocol] [host] <source|any> [host] <destination|any> [eq <port>]." };
    const rule = parseAclRule(device.activeAcl, match[1], match[2] ?? "ip", match[3], match[4] ?? "any", match[5]);
    if (!rule) return { device, output: "% This teaching ACL subset accepts IPv4 host addresses or any, with optional TCP/UDP ports." };
    return { device: { ...device, aclRules: [...device.aclRules, rule] }, output: `Access-list ${rule.name} rule added.` };
  }
  if (device.mode === "config" && /^access-group\s+/i.test(command)) {
    if (device.kind !== "firewall") return { device, output: "% access-group is available on firewall profiles only." };
    return { device: { ...device, accessGroups: [...device.accessGroups, command] }, output: "Access-group binding added." };
  }
  return { device, output: cliError(command, device) };
}
