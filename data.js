// Auto-generated data file for CNC Lab Portal
window.CNC_DATA = {
  "programs": [
    {
      "id": "p1",
      "part": "Part A",
      "num": "Program 1",
      "title": "3-Node Point-to-Point Network & Packet Drop Analysis",
      "badge": "3 Nodes \u2022 Point-to-Point \u2022 CBR/UDP",
      "question": "Simulate a three nodes point-to-point network with duplex links between them. Set the queue size, vary the bandwidth and find the number of packets dropped.",
      "summary": "Simulate a 3-node linear topology with DropTail queues. CBR traffic is generated over UDP from node 0 to node 2 via router node 1. Observe and count packet drops when incoming traffic exceeds queue and bandwidth limits.",
      "topology": {
        "type": "Point-to-Point (Linear)",
        "nodes": [
          "n0 (Source)",
          "n1 (Router)",
          "n2 (Sink)"
        ],
        "links": [
          {
            "from": "n0",
            "to": "n1",
            "bw": "500Kb",
            "delay": "10ms",
            "queue": "DropTail (limit: 5)"
          },
          {
            "from": "n1",
            "to": "n2",
            "bw": "500Kb",
            "delay": "10ms",
            "queue": "DropTail (limit: 5)"
          }
        ],
        "agents": "Agent/UDP on n0 connected to Agent/Null on n2",
        "traffic": "Application/Traffic/CBR (packetSize: 500B, interval: 0.005s)"
      },
      "files": [
        {
          "name": "main.tcl",
          "lang": "tcl",
          "path": "partA/p1/main.tcl",
          "description": "NS-2 simulation script defining topology, agents, CBR traffic, and trace hooks.",
          "content": "set ns [new Simulator]\n\nset tf [open out.tr w]\n\n$ns trace-all $tf\n\nset nf [open out.nam w]\n$ns namtrace-all $nf\n\nproc finish {} {\n\tglobal ns nf tf\n\t$ns flush-trace\n\tclose $nf\n\tclose $tf\n\texec nam out.nam &\n\texit 0\n}\n\nset n0 [$ns node]\nset n1 [$ns node]\nset n2 [$ns node]\n\n$ns duplex-link $n0 $n1 500Kb  10ms DropTail\n$ns duplex-link $n1 $n2 500Kb  10ms DropTail\n\n$ns queue-limit $n0 $n1 5\n$ns queue-limit $n1 $n2 5\n\nset udp [new Agent/UDP]\n$ns attach-agent $n0 $udp\n\nset null [new Agent/Null]\n$ns attach-agent $n2 $null\n\n$ns connect $udp $null\n\nset cbr [new Application/Traffic/CBR]\n$cbr set packetSize_ 500\n$cbr set interval_ 0.005\n$cbr attach-agent $udp\n\n$ns at 0.5 \"$cbr start\"\n$ns at 5.0 \"$cbr stop\"\n\n$ns at 5.0 \"finish\"\n\n$ns run\n"
        },
        {
          "name": "main.awk",
          "lang": "awk",
          "path": "partA/p1/main.awk",
          "description": "AWK script to parse out.tr and count dropped packets (lines where event  == \"d\").",
          "content": "BEGIN{\n\tcount = 0;\n}\n{\n\tif($1==\"d\"){\n\t\tcount++;\n\t}\n}\nEND{\n\tprintf(\"Number of packets dropped : %d\",count);\n}\n"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "ns main.tcl",
            "desc": "Runs the simulation, outputs out.tr & out.nam, and launches Network Animator."
          },
          {
            "cmd": "awk -f main.awk out.tr",
            "desc": "Parses the trace file and prints the number of dropped packets."
          },
          {
            "cmd": "grep -c \"^d\" out.tr",
            "desc": "Alternative quick bash one-liner to verify total dropped packets."
          }
        ],
        "expected": "Number of packets dropped : 89"
      }
    },
    {
      "id": "p2",
      "part": "Part A",
      "num": "Program 2",
      "title": "4-Node TCP vs UDP Traffic & Throughput Analysis",
      "badge": "4 Nodes \u2022 TCP/FTP vs UDP/CBR",
      "question": "Simulate a four node point-to-point network, and connect the links as follows: n0-n2, n1-n2 and n2-n3. Apply TCP agent between n0-n3 and UDP n1-n3. Apply relevant applications over TCP and UDP agents changing the parameter and determine the number of packets by TCP/UDP and analyse the throughput.",
      "summary": "Simulate concurrent TCP (FTP) and UDP (CBR) traffic across an intermediate bottleneck node. Measures packet counts for each protocol and calculates overall throughput using AWK.",
      "topology": {
        "type": "Star / Tree Bottleneck",
        "nodes": [
          "n0 (TCP Src)",
          "n1 (UDP Src)",
          "n2 (Bottleneck Router)",
          "n3 (Shared Dest)"
        ],
        "links": [
          {
            "from": "n0",
            "to": "n2",
            "bw": "1Mb",
            "delay": "10ms",
            "queue": "DropTail (limit: 50)"
          },
          {
            "from": "n1",
            "to": "n2",
            "bw": "1Mb",
            "delay": "10ms",
            "queue": "DropTail (limit: 50)"
          },
          {
            "from": "n2",
            "to": "n3",
            "bw": "1Mb",
            "delay": "10ms",
            "queue": "DropTail (limit: 50)"
          }
        ],
        "agents": "TCP on n0 -> TCPSink on n3; UDP on n1 -> Null on n3",
        "traffic": "FTP over TCP (bash.5s-.0s); CBR over UDP (bash.5s-.5s)"
      },
      "files": [
        {
          "name": "main.tcl",
          "lang": "tcl",
          "path": "partA/p2/main.tcl",
          "description": "NS-2 simulation script with two concurrent traffic flows (TCP and UDP) sharing link n2-n3.",
          "content": "set ns [new Simulator]\n\nset tf [open out.tr w]\n\nset nf [open out.nam w]\n\n$ns namtrace-all $nf\n\n$ns trace-all $tf\n\nproc finish {} {\n\tglobal ns nf tf\n\t$ns flush-trace\n\tclose $nf\n\tclose $tf\n\texec nam out.nam &\n\texit 0\n}\n\nset n0 [$ns node]\nset n1 [$ns node]\nset n2 [$ns node]\nset n3 [$ns node]\n$ns duplex-link $n0 $n2 1Mb 10ms DropTail\n\n$ns duplex-link $n1 $n2 1Mb 10ms DropTail\n\n$ns duplex-link $n2 $n3 1Mb 10ms DropTail\n\n$ns queue-limit $n0 $n2 50\n$ns queue-limit $n1 $n2 50\n$ns queue-limit $n2 $n3 50\n\nset tcp [new Agent/TCP]\n$ns attach-agent $n0 $tcp\nset tcpSink [new Agent/TCPSink]\n$ns attach-agent $n3 $tcpSink\n$ns connect $tcp $tcpSink\n\nset ftp [new Application/FTP]\n$ftp attach-agent $tcp\n\nset udp [new Agent/UDP]\n$ns attach-agent $n1 $udp\nset null [new Agent/Null]\n$ns attach-agent $n3 $null\n$ns connect $udp $null\n\nset cbr [new Application/Traffic/CBR]\n$cbr set interval_ 0.005\n$cbr set packetSize_ 500\n$cbr attach-agent $udp\n\n$ns at 0.5 \"$cbr start\"\n$ns at 5.5 \"$cbr stop\"\n\n$ns at 0.5 \"$ftp start\"\n$ns at 5.0 \"$ftp stop\"\n\n$ns run\n"
        },
        {
          "name": "main.awk",
          "lang": "awk",
          "path": "partA/p2/main.awk",
          "description": "AWK script calculating TCP & UDP packet counts and throughput.",
          "content": "BEGIN{\n\tntcp = 0;\n\tnudp = 0;\n\tsSize = 0;\n\tstartTime = 0;\n\tstopTime = 0;\n\ttput = 0;\n}\n{\n\ttype = $5;\n\tevent = $1;\n\ttime = $2;\n\tsize = $6;\n\n\tif(event == \"+\"){\n\t\tif(time < startTime){\n\t\t\tstartTime = time;\n\t\t}\n\t}\n\n\tif(event == \"+\"){\n\t\tif(time > stopTime){\n\t\t\tstopTime = time;\n\t\t}\n\n\t\tsSize += size;\n\t}\n\n\tif(type == \"tcp\"){\n\t\tntcp++;\n\t}\n\tif(type == \"cbr\"){\n\t\tnudp++;\n\t}\n}\nEND{\n\ttput =  (sSize / (stopTime - startTime)) * (8 / 1000);\n\tprintf(\"No of tcp packets : %d \\n\", ntcp);\n\tprintf(\"no of udp packet : %d \\n\",nudp);\n\tprintf(\"Throughput : %.2f \", tput);\n}\n"
        },
        {
          "name": "main_fixed.awk",
          "lang": "awk",
          "path": "partA/p2/main_fixed.awk (Recommended Fix)",
          "description": "Fixed AWK script resolving the \"No of tcp packets: 0\" bug by matching  == \"tcp\".",
          "content": "BEGIN{\n\tntcp = 0;\n\tnudp = 0;\n\tsSize = 0;\n\tstartTime = 0;\n\tstopTime = 0;\n\ttput = 0;\n}\n{\n\ttype = ;\n\tevent = ;\n\ttime = ;\n\tsize = ;\n\n\tif(event == \"+\"){\n\t\tif(time < startTime){\n\t\t\tstartTime = time;\n\t\t}\n\t}\n\n\tif(event == \"+\"){\n\t\tif(time > stopTime){\n\t\t\tstopTime = time;\n\t\t}\n\n\t\tsSize += size;\n\t}\n\n\t# Note: In NS-2 trace files, column 5 is \"tcp\", not \"ftp\"!\n\tif(type == \"tcp\"){\n\t\tntcp++;\n\t}\n\tif(type == \"cbr\"){\n\t\tnudp++;\n\t}\n}\nEND{\n\ttput =  (sSize / (stopTime - startTime)) * (8 / 1000);\n\tprintf(\"No of tcp packets : %d \n\", ntcp);\n\tprintf(\"no of udp packet : %d \n\", nudp);\n\tprintf(\"Throughput : %.2f Kbps\n\", tput);\n}"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "ns main.tcl",
            "desc": "Executes 4-node simulation, creates out.tr and out.nam, launches NAM."
          },
          {
            "cmd": "awk -f main.awk out.tr",
            "desc": "Calculates packet counts and throughput."
          }
        ],
        "tip": "Why was TCP count 0? In NS-2 trace files, field  represents packet type: \"tcp\" or \"cbr\", never \"ftp\"! Checking  == \"tcp\" fixes the count.",
        "expected": "No of tcp packets : 1240\nno of udp packet : 2509\nThroughput : 1797.38 Kbps"
      }
    },
    {
      "id": "p3",
      "part": "Part A",
      "num": "Program 3",
      "title": "Ethernet LAN using N-Nodes (802.3 MAC) & Throughput",
      "badge": "Ethernet LAN \u2022 802.3 Bus \u2022 TCP/FTP",
      "question": "Simulate an Ethernet LAN using N-nodes (6-10), change data rate and compare the throughput.",
      "summary": "Simulate an Ethernet LAN connecting nodes n0-n7 over an 802.3 CSMA/CD shared medium (10Mb, 10ms), connected to destination node n8 via point-to-point duplex link. Measures throughput under varying conditions.",
      "topology": {
        "type": "Bus LAN + Point-to-Point Gateway",
        "nodes": [
          "n0-n7 (Shared LAN Nodes)",
          "n8 (Outside Gateway / Dest)"
        ],
        "links": [
          {
            "from": "n0..n7",
            "to": "LAN Bus",
            "bw": "10Mb",
            "delay": "10ms",
            "queue": "LL Mac/802_3 Queue/DropTail"
          },
          {
            "from": "n7",
            "to": "n8",
            "bw": "1Mb",
            "delay": "10ms",
            "queue": "DropTail (limit: 50)"
          }
        ],
        "agents": "Agent/TCP on n0 connected to Agent/TCPSink on n8",
        "traffic": "Application/FTP over TCP from 0.5s to 5.0s"
      },
      "files": [
        {
          "name": "main.tcl",
          "lang": "tcl",
          "path": "partA/p3/main.tcl",
          "description": "NS-2 script using $ns make-lan to configure an 802.3 Ethernet local area network.",
          "content": "set ns [new Simulator]\n\n# Create trace files\nset nf [open out.nam w]\n$ns namtrace-all $nf\n\nset tf [open out.tr w]\n$ns trace-all $tf\n\n# Finish procedure\nproc finish {} {\n    global ns nf tf\n\n    $ns flush-trace\n    close $nf\n    close $tf\n\n    exec nam out.nam &\n    exit 0\n}\n\n\nset n0 [$ns node]\nset n1 [$ns node]\nset n2 [$ns node]\nset n3 [$ns node]\nset n4 [$ns node]\nset n5 [$ns node]\nset n6 [$ns node]\nset n7 [$ns node]\nset n8 [$ns node]\n\n$ns duplex-link $n7 $n8 1Mb 10ms DropTail\n$ns queue-limit $n7 $n8 50\n\n$ns make-lan \"$n0 $n1 $n2 $n3 $n4 $n5 $n6 $n7\" 10Mb 10ms LL Queue/DropTail Mac/802_3\n\nset tcp [new Agent/TCP]\n$ns attach-agent $n0 $tcp\nset tcpSink [new Agent/TCPSink]\n$ns attach-agent $n8 $tcpSink\n$ns connect $tcp $tcpSink\n\nset ftp [new Application/FTP]\n$ftp attach-agent $tcp\n\n$ns at 0.5 \"$ftp start\"\n$ns at 5.0 \"$ftp stop\"\n\n$ns at 5.0 \"finish\"\n$ns run\n"
        },
        {
          "name": "main.awk",
          "lang": "awk",
          "path": "partA/p3/main.awk",
          "description": "AWK script computing aggregate LAN throughput in Kbps.",
          "content": "BEGIN{\n\n\tsSize = 0;\n\tstartTime = 0;\n\tstopTime = 0;\n\ttput = 0;\n}\n{\n\ttype = $5;\n\tevent = $1;\n\ttime = $2;\n\tsize = $6;\n\n\tif(event == \"+\"){\n\t\tif(time < startTime){\n\t\t\tstartTime = time;\n\t\t}\n\t}\n\n\tif(event == \"+\"){\n\t\tif(time > stopTime){\n\t\t\tstopTime = time;\n\t\t}\n\n\t\tsSize += size;\n\t}\n\n\n}\nEND{\n\ttput =  (sSize / (stopTime - startTime)) * (8 / 1000);\n\tprintf(\"Throughput : %.2f \", tput);\n}\n"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "ns main.tcl",
            "desc": "Simulates Ethernet LAN transmission and animates CSMA/CD bus in NAM."
          },
          {
            "cmd": "awk -f main.awk out.tr",
            "desc": "Computes LAN throughput from trace timestamps and packet sizes."
          }
        ],
        "expected": "Throughput : 179.74 Kbps"
      }
    },
    {
      "id": "p4",
      "part": "Part A",
      "num": "Program 4",
      "title": "Ping / Congestion Window / Wireless 802.11 Simulation",
      "badge": "Upcoming Lab \u2022 VTU Syllabus",
      "question": "Simulate transmission of ping messages over a network topology consisting of 6 nodes and find the number of packets dropped due to congestion (or implement 802.11 Wireless LAN).",
      "summary": "Upcoming experiment for Part A. Covers Agent/Ping or TCP Congestion Window analysis across multi-hop topologies.",
      "topology": {
        "type": "Multi-hop / Wireless Topology",
        "nodes": [
          "n0 to n5"
        ],
        "links": [
          {
            "from": "n0..n5",
            "to": "Network",
            "bw": "Configurable",
            "delay": "10ms",
            "queue": "DropTail / 802.11"
          }
        ],
        "agents": "Agent/Ping or Agent/TCP",
        "traffic": "Ping requests or CBR"
      },
      "files": [
        {
          "name": "main.awk",
          "lang": "awk",
          "path": "partA/p4/main.awk",
          "description": "Placeholder awk script for Program 4.",
          "content": "# Program 4 AWK parser\nBEGIN {\n    dropCount = 0;\n}\n{\n    if ( == \"d\") {\n        dropCount++;\n    }\n}\nEND {\n    printf(\"Total dropped packets: %d\n\", dropCount);\n}"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "ns main.tcl",
            "desc": "Execute program 4 simulation once configured."
          },
          {
            "cmd": "awk -f main.awk out.tr",
            "desc": "Parse program 4 output trace."
          }
        ],
        "expected": "Coming soon"
      }
    }
  ],
  "setup": {
    "title": "NS-2 & NAM Arch Linux Installation",
    "subtitle": "Automated script and dependencies for NS-2.35 and NAM-1.15 on Arch Linux / Garuda / Manjaro",
    "files": [
      {
        "name": "script.sh",
        "lang": "bash",
        "path": "script.sh",
        "description": "Automated bash script to install yay, GCC 4.8, libx11, libxmu, build and link NS-2.35 and NAM-1.15.",
        "content": "\n#!/bin/bash\n\nset -e\n\necho \"======================================\"\necho \" Installing NS-2.35 and NAM-1.15\"\necho \"======================================\"\n\n# 1. Install yay if not already installed\nif ! command -v yay &> /dev/null; then\n    echo \"[1/5] Installing yay...\"\n\n    sudo pacman -S --needed git base-devel\n\n    git clone https://aur.archlinux.org/yay.git\n    cd yay\n    makepkg -si --noconfirm\n    cd ..\n    rm -rf yay\nelse\n    echo \"[1/5] yay is already installed.\"\nfi\n\n# 2. Install GCC 4.8\necho \"[2/5] Installing gcc48...\"\nyay -S --needed gcc48 --noconfirm\n\n# 3. Download and extract NS-2.35\necho \"[3/5] Downloading NS-2.35...\"\n\nif [ ! -f ns-allinone-2.35_gcc5.tar.gz ]; then\n    echo \"Please place ns-allinone-2.35_gcc5.tar.gz in the current directory.\"\n    exit 1\nfi\n\ntar -xf ns-allinone-2.35_gcc5.tar.gz\n\ncd ns-allinone-2.35/\n\n# 4. Install dependencies\necho \"[4/5] Installing dependencies...\"\nsudo pacman -S --needed libx11 libxmu\n\n# 5. Build NS-2.35 and NAM-1.15\necho \"[5/5] Building NS-2.35 and NAM-1.15...\"\n\nexport CC=gcc-4.8\nexport CXX=g++-4.8\n\n./install\n\n# Install NAM\necho \"Installing NAM-1.15...\"\ncd nam-1.15/\nsudo make install\n\n# Install NS-2\necho \"Installing NS-2.35...\"\ncd ../ns-2.35/\nsudo make install\n\necho \"======================================\"\necho \" NS-2.35 and NAM-1.15 installation completed!\"\necho \"======================================\"\n"
      },
      {
        "name": "SETUP_ARCH.md",
        "lang": "markdown",
        "path": "SETUP_ARCH.md",
        "description": "Community guide reference link for Garuda / Arch Linux NS-2 build troubleshooting.",
        "content": "https://forum.garudalinux.org/t/network-animator-and-network-simulator-installation-script/26240"
      }
    ]
  },
  "traceGuide": {
    "title": "NS-2 Trace File (.tr) Anatomy & Cheat Sheet",
    "subtitle": "Detailed breakdown of the 12 fields logged for every packet event in out.tr",
    "fields": [
      {
        "col": "",
        "name": "Event",
        "desc": "Action performed: + (enqueued), - (dequeued), r (received), d (dropped)."
      },
      {
        "col": "",
        "name": "Time",
        "desc": "Simulation time in seconds when event occurred (e.g. 0.51032)."
      },
      {
        "col": "",
        "name": "From Node",
        "desc": "Node ID where packet originates / departs from."
      },
      {
        "col": "",
        "name": "To Node",
        "desc": "Next hop node ID receiving the packet."
      },
      {
        "col": "",
        "name": "Packet Type",
        "desc": "Protocol: tcp, ack, cbr, udp, rtProtoDV, etc. (Never \"ftp\" or application names!)."
      },
      {
        "col": "",
        "name": "Packet Size",
        "desc": "Size of the packet in bytes (e.g. 500, 40)."
      },
      {
        "col": "",
        "name": "Flags",
        "desc": "7-character string for ECN, priority flags (e.g. -------)."
      },
      {
        "col": "",
        "name": "Flow ID (fid)",
        "desc": "Class or flow identifier assigned in TCL via $agent set fid_ X."
      },
      {
        "col": "",
        "name": "Source Address",
        "desc": "node.port address format (e.g. 0.0 or 1.0)."
      },
      {
        "col": "0",
        "name": "Dest Address",
        "desc": "node.port address format (e.g. 3.0 or 3.1)."
      },
      {
        "col": "1",
        "name": "Sequence Num",
        "desc": "Packet sequence number maintained by transport agent."
      },
      {
        "col": "2",
        "name": "Packet ID",
        "desc": "Unique identifier for the packet throughout the simulation."
      }
    ]
  }
};
