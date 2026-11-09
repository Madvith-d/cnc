// Auto-generated data file for CNC Lab Portal
// Run ./sync.py whenever you add or edit files in partA/ or partB/
window.CNC_DATA = {
  "programs": [
    {
      "id": "partA-p1",
      "shortId": "p1",
      "part": "Part A",
      "category": "partA",
      "num": "Program 1",
      "title": "3-Node Point-to-Point Network & Packet Drop Analysis",
      "badge": "3 Nodes \u2022 Point-to-Point \u2022 CBR/UDP",
      "question": "Simulate a three nodes point-to-point network with duplex links between them. Set the queue size, vary the bandwidth and find the number of packets dropped.",
      "summary": "Simulate a 3-node linear topology with DropTail queues. CBR traffic is generated over UDP from node 0 to node 2 via router node 1. Observe and count packet drops when incoming traffic exceeds queue and bandwidth limits.",
      "hasTopology": true,
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
          "name": "main.awk",
          "lang": "awk",
          "path": "partA/p1/main.awk",
          "description": "main.awk script for P1",
          "content": "BEGIN{\n\tcount = 0;\n}\n{\n\tif($1==\"d\"){\n\t\tcount++;\n\t}\n}\nEND{\n\tprintf(\"Number of packets dropped : %d\",count);\n}\n"
        },
        {
          "name": "main.tcl",
          "lang": "tcl",
          "path": "partA/p1/main.tcl",
          "description": "main.tcl script for P1",
          "content": "set ns [new Simulator]\n\nset tf [open out.tr w]\n\n$ns trace-all $tf\n\nset nf [open out.nam w]\n$ns namtrace-all $nf\n\nproc finish {} {\n\tglobal ns nf tf\n\t$ns flush-trace\n\tclose $nf\n\tclose $tf\n\texec nam out.nam &\n\texit 0\n}\n\nset n0 [$ns node]\nset n1 [$ns node]\nset n2 [$ns node]\n\n$ns duplex-link $n0 $n1 500Kb  10ms DropTail\n$ns duplex-link $n1 $n2 500Kb  10ms DropTail\n\n$ns queue-limit $n0 $n1 5\n$ns queue-limit $n1 $n2 5\n\nset udp [new Agent/UDP]\n$ns attach-agent $n0 $udp\n\nset null [new Agent/Null]\n$ns attach-agent $n2 $null\n\n$ns connect $udp $null\n\nset cbr [new Application/Traffic/CBR]\n$cbr set packetSize_ 500\n$cbr set interval_ 0.005\n$cbr attach-agent $udp\n\n$ns at 0.5 \"$cbr start\"\n$ns at 5.0 \"$cbr stop\"\n\n$ns at 5.0 \"finish\"\n\n$ns run\n"
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
      "id": "partA-p2",
      "shortId": "p2",
      "part": "Part A",
      "category": "partA",
      "num": "Program 2",
      "title": "4-Node TCP vs UDP Traffic & Throughput Analysis",
      "badge": "4 Nodes \u2022 TCP/FTP vs UDP/CBR",
      "question": "Simulate a four node point-to-point network, and connect the links as follows: n0-n2, n1-n2 and n2-n3. Apply TCP agent between n0-n3 and UDP n1-n3. Apply relevant applications over TCP and UDP agents changing the parameter and determine the number of packets by TCP/UDP and analyse the throughput.",
      "summary": "Simulate concurrent TCP (FTP) and UDP (CBR) traffic across an intermediate bottleneck node. Measures packet counts for each protocol and calculates overall throughput using AWK.",
      "hasTopology": true,
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
        "traffic": "FTP over TCP ($0.5s-$5.0s); CBR over UDP ($0.5s-$5.5s)"
      },
      "files": [
        {
          "name": "main.awk",
          "lang": "awk",
          "path": "partA/p2/main.awk",
          "description": "main.awk script for P2",
          "content": "BEGIN{\n\tntcp = 0;\n\tnudp = 0;\n\tsSize = 0;\n\tstartTime = 0;\n\tstopTime = 0;\n\ttput = 0;\n}\n{\n\ttype = $5;\n\tevent = $1;\n\ttime = $2;\n\tsize = $6;\n\n\tif(event == \"+\"){\n\t\tif(time < startTime){\n\t\t\tstartTime = time;\n\t\t}\n\t}\n\n\tif(event == \"+\"){\n\t\tif(time > stopTime){\n\t\t\tstopTime = time;\n\t\t}\n\n\t\tsSize += size;\n\t}\n\n\tif(type == \"tcp\"){\n\t\tntcp++;\n\t}\n\tif(type == \"cbr\"){\n\t\tnudp++;\n\t}\n}\nEND{\n\ttput =  (sSize / (stopTime - startTime)) * (8 / 1000);\n\tprintf(\"No of tcp packets : %d \\n\", ntcp);\n\tprintf(\"no of udp packet : %d \\n\",nudp);\n\tprintf(\"Throughput : %.2f \", tput);\n}\n"
        },
        {
          "name": "main.tcl",
          "lang": "tcl",
          "path": "partA/p2/main.tcl",
          "description": "main.tcl script for P2",
          "content": "set ns [new Simulator]\n\nset tf [open out.tr w]\n\nset nf [open out.nam w]\n\n$ns namtrace-all $nf\n\n$ns trace-all $tf\n\nproc finish {} {\n\tglobal ns nf tf\n\t$ns flush-trace\n\tclose $nf\n\tclose $tf\n\texec nam out.nam &\n\texit 0\n}\n\nset n0 [$ns node]\nset n1 [$ns node]\nset n2 [$ns node]\nset n3 [$ns node]\n$ns duplex-link $n0 $n2 1Mb 10ms DropTail\n\n$ns duplex-link $n1 $n2 1Mb 10ms DropTail\n\n$ns duplex-link $n2 $n3 1Mb 10ms DropTail\n\n$ns queue-limit $n0 $n2 50\n$ns queue-limit $n1 $n2 50\n$ns queue-limit $n2 $n3 50\n\nset tcp [new Agent/TCP]\n$ns attach-agent $n0 $tcp\nset tcpSink [new Agent/TCPSink]\n$ns attach-agent $n3 $tcpSink\n$ns connect $tcp $tcpSink\n\nset ftp [new Application/FTP]\n$ftp attach-agent $tcp\n\nset udp [new Agent/UDP]\n$ns attach-agent $n1 $udp\nset null [new Agent/Null]\n$ns attach-agent $n3 $null\n$ns connect $udp $null\n\nset cbr [new Application/Traffic/CBR]\n$cbr set interval_ 0.005\n$cbr set packetSize_ 500\n$cbr attach-agent $udp\n\n$ns at 0.5 \"$cbr start\"\n$ns at 5.5 \"$cbr stop\"\n\n$ns at 0.5 \"$ftp start\"\n$ns at 5.0 \"$ftp stop\"\n\n$ns run\n"
        },
        {
          "name": "main_fixed.awk",
          "lang": "awk",
          "path": "partA/p2/main_fixed.awk (Recommended Fix)",
          "description": "Fixed AWK script checking $5 == \"tcp\" instead of \"ftp\".",
          "content": "BEGIN{\n\tntcp = 0;\n\tnudp = 0;\n\tsSize = 0;\n\tstartTime = 0;\n\tstopTime = 0;\n\ttput = 0;\n}\n{\n\ttype = $5;\n\tevent = $1;\n\ttime = $2;\n\tsize = $6;\n\n\tif(event == \"+\"){\n\t\tif(time < startTime){\n\t\t\tstartTime = time;\n\t\t}\n\t}\n\n\tif(event == \"+\"){\n\t\tif(time > stopTime){\n\t\t\tstopTime = time;\n\t\t}\n\n\t\tsSize += size;\n\t}\n\n\t# Note: In NS-2 trace files, column 5 is \"tcp\", not \"ftp\"!\n\tif(type == \"tcp\"){\n\t\tntcp++;\n\t}\n\tif(type == \"cbr\"){\n\t\tnudp++;\n\t}\n}\nEND{\n\ttput =  (sSize / (stopTime - startTime)) * (8 / 1000);\n\tprintf(\"No of tcp packets : %d \\n\", ntcp);\n\tprintf(\"no of udp packet : %d \\n\", nudp);\n\tprintf(\"Throughput : %.2f Kbps\\n\", tput);\n}"
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
        "tip": "Why was TCP count 0? In NS-2 trace files, field $5 represents packet type: \"tcp\" or \"cbr\", never \"ftp\"! Checking $5 == \"tcp\" fixes the count.",
        "expected": "No of tcp packets : 1240\nno of udp packet : 2509\nThroughput : 1797.38 Kbps"
      }
    },
    {
      "id": "partA-p3",
      "shortId": "p3",
      "part": "Part A",
      "category": "partA",
      "num": "Program 3",
      "title": "Ethernet LAN using N-Nodes (802.3 MAC) & Throughput",
      "badge": "Ethernet LAN \u2022 802.3 Bus \u2022 TCP/FTP",
      "question": "Simulate an Ethernet LAN using N-nodes (6-10), change data rate and compare the throughput.",
      "summary": "Simulate an Ethernet LAN connecting nodes n0-n7 over an 802.3 CSMA/CD shared medium (10Mb, 10ms), connected to destination node n8 via point-to-point duplex link. Measures throughput under varying conditions.",
      "hasTopology": true,
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
          "name": "main.awk",
          "lang": "awk",
          "path": "partA/p3/main.awk",
          "description": "main.awk script for P3",
          "content": "BEGIN{\n\n\tsSize = 0;\n\tstartTime = 0;\n\tstopTime = 0;\n\ttput = 0;\n}\n{\n\ttype = $5;\n\tevent = $1;\n\ttime = $2;\n\tsize = $6;\n\n\tif(event == \"+\"){\n\t\tif(time < startTime){\n\t\t\tstartTime = time;\n\t\t}\n\t}\n\n\tif(event == \"+\"){\n\t\tif(time > stopTime){\n\t\t\tstopTime = time;\n\t\t}\n\n\t\tsSize += size;\n\t}\n\n\n}\nEND{\n\ttput =  (sSize / (stopTime - startTime)) * (8 / 1000);\n\tprintf(\"Throughput : %.2f \", tput);\n}\n"
        },
        {
          "name": "main.tcl",
          "lang": "tcl",
          "path": "partA/p3/main.tcl",
          "description": "main.tcl script for P3",
          "content": "set ns [new Simulator]\n\n# Create trace files\nset nf [open out.nam w]\n$ns namtrace-all $nf\n\nset tf [open out.tr w]\n$ns trace-all $tf\n\n# Finish procedure\nproc finish {} {\n    global ns nf tf\n\n    $ns flush-trace\n    close $nf\n    close $tf\n\n    exec nam out.nam &\n    exit 0\n}\n\n\nset n0 [$ns node]\nset n1 [$ns node]\nset n2 [$ns node]\nset n3 [$ns node]\nset n4 [$ns node]\nset n5 [$ns node]\nset n6 [$ns node]\nset n7 [$ns node]\nset n8 [$ns node]\n\n$ns duplex-link $n7 $n8 1Mb 10ms DropTail\n$ns queue-limit $n7 $n8 50\n\n$ns make-lan \"$n0 $n1 $n2 $n3 $n4 $n5 $n6 $n7\" 10Mb 10ms LL Queue/DropTail Mac/802_3\n\nset tcp [new Agent/TCP]\n$ns attach-agent $n0 $tcp\nset tcpSink [new Agent/TCPSink]\n$ns attach-agent $n8 $tcpSink\n$ns connect $tcp $tcpSink\n\nset ftp [new Application/FTP]\n$ftp attach-agent $tcp\n\n$ns at 0.5 \"$ftp start\"\n$ns at 5.0 \"$ftp stop\"\n\n$ns at 5.0 \"finish\"\n$ns run\n"
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
      "id": "partA-p4",
      "shortId": "p4",
      "part": "Part A",
      "category": "partA",
      "num": "Program 4",
      "title": "Ethernet LAN Multi-Traffic, Collisions & Congestion Window (cwnd)",
      "badge": "Ethernet LAN \u2022 Congestion Window \u2022 2 TCP Flows",
      "question": "Simulate an Ethernet LAN using N nodes and set multiple traffic nodes and determine collision across different nodes, also plot congestion window for different source/destination.",
      "summary": "Simulate an Ethernet LAN using N nodes with multiple simultaneous TCP traffic sources. Trace and extract TCP congestion window (cwnd_) dynamics to analyze window growth, timeouts, and collision avoidance.",
      "hasTopology": true,
      "topology": {
        "type": "Ethernet Bus LAN + Gateway Link",
        "nodes": [
          "Src1 (n0)",
          "Src2 (n1)",
          "n2..n5",
          "Dst2 (n6)",
          "Gateway (n7)",
          "Dst1 (n8)"
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
            "delay": "1ms",
            "queue": "DropTail (limit: 5)"
          }
        ],
        "agents": "TCP0 on n0 -> Sink1 on n8; TCP1 on n1 -> Sink2 on n6",
        "traffic": "FTP0 (0.5s-5.0s, 5.5s-12.0s); FTP1 (1.0s-6.0s, 7.0s-13.0s)"
      },
      "files": [
        {
          "name": "main.awk",
          "lang": "awk",
          "path": "partA/p4/main.awk",
          "description": "main.awk script for P4",
          "content": "BEGIN{\n}\n{\nif($6==\"cwnd_\")\nprint(\"%f\\t\\t%f\\n\",$1,$7);\n}\nEND{\n}\n"
        },
        {
          "name": "main.tcl",
          "lang": "tcl",
          "path": "partA/p4/main.tcl",
          "description": "main.tcl script for P4",
          "content": "# This script is created by NSG2 beta1\n# <http://wushoupong.googlepages.com/nsg>\n\n#===================================\n#     Simulation parameters setup\n#===================================\nset val(stop)   15.0                         ;# time of simulation end\n\n#===================================\n#        Initialization        \n#===================================\n#Create a ns simulator\nset ns [new Simulator]\n\n#Open the NS trace file\nset tracefile [open out.tr w]\n$ns trace-all $tracefile\n\n#Open the NAM trace file\nset namfile [open out.nam w]\n$ns namtrace-all $namfile\n\n#===================================\n#        Nodes Definition        \n#===================================\n#Create 6 nodes\nset n0 [$ns node]\nset n1 [$ns node]\nset n2 [$ns node]\nset n3 [$ns node]\nset n4 [$ns node]\nset n5 [$ns node]\nset n6 [$ns node]\nset n7 [$ns node]\nset n8 [$ns node]\n\n\n$n0 color \"blue\"\n$n0 label \"Src1\"\n\n$n1 color \"blue\"\n$n1 label \"Src2\"\n\n$n8 color \"red\"\n$n8 label \"Dst1\"\n\n$n6 color \"red\"\n$n6 label \"Dst2\"\n#===================================\n#        Links Definition        \n#===================================\n#Createlinks between nodes\n$ns make-lan \"$n0 $n1 $n2 $n3 $n4 $n5 $n6 $n7\" 10Mb 10ms LL Queue/DropTail Mac/802_3 \n$ns duplex-link $n7 $n8 1.0Mb 1ms DropTail\n$ns queue-limit $n7 $n8 5\n\n#Give node position (for NAM)\n$ns duplex-link-op $n7 $n8 orient right-down\n\n#===================================\n#        Agents Definition        \n#===================================\n#Setup a TCP connection\nset tcp0 [new Agent/TCP]\n$ns attach-agent $n0 $tcp0\nset sink1 [new Agent/TCPSink]\n$ns attach-agent $n8 $sink1\n$ns connect $tcp0 $sink1\n$tcp0 set packetSize_ 1500\n\n#Setup a TCP connection\nset tcp1 [new Agent/TCP]\n$ns attach-agent $n1 $tcp1\nset sink2 [new Agent/TCPSink]\n$ns attach-agent $n6 $sink2\n$ns connect $tcp1 $sink2\n$tcp1 set packetSize_ 1500\n\n\n#===================================\n#        Applications Definition        \n#===================================\n#Setup a FTP Application over TCP connection\nset ftp0 [new Application/FTP]\n$ftp0 attach-agent $tcp0\n$ns at 0.5 \"$ftp0 start\"\n$ns at 5.0 \"$ftp0 stop\"\n$ns at 5.5 \"$ftp0 start\"\n$ns at 12.0 \"$ftp0 stop\"\n\n#Setup a FTP Application over TCP connection\nset ftp1 [new Application/FTP]\n$ftp1 attach-agent $tcp1\n$ns at 1.0 \"$ftp1 start\"\n$ns at 6.0 \"$ftp1 stop\"\n$ns at 7.0 \"$ftp1 start\"\n$ns at 13.0 \"$ftp1 stop\"\n\nset file1 [open file1.tr w]\n$tcp0 attach $file1\n\nset file2 [open file2.tr w]\n$tcp1 attach $file2\n\n$tcp0 trace cwnd_\n$tcp1 trace cwnd_\n\n#===================================\n#        Termination        \n#===================================\n#Define a 'finish' procedure\nproc finish {} {\n    global ns tracefile namfile\n    $ns flush-trace\n    close $tracefile\n    close $namfile\n    exec nam out.nam &\n    exit 0\n}\n$ns at $val(stop) \"$ns nam-end-wireless $val(stop)\"\n$ns at $val(stop) \"finish\"\n$ns at $val(stop) \"puts \\\"done\\\" ; $ns halt\"\n$ns run\n\n"
        },
        {
          "name": "main_fixed.awk",
          "lang": "awk",
          "path": "partA/p4/main_fixed.awk (Recommended Fix)",
          "description": "Formatted AWK script using printf for clean numerical xgraph output.",
          "content": "BEGIN{\n}\n{\n\tif($6 == \"cwnd_\") {\n\t\t# $1 is simulation time, $7 is congestion window size (cwnd_)\n\t\tprintf(\"%f\\t%f\\n\", $1, $7);\n\t}\n}\nEND{\n}"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "ns main.tcl",
            "desc": "Executes simulation, outputs tracefile, and logs cwnd_ to file1.tr and file2.tr."
          },
          {
            "cmd": "awk -f main.awk file1.tr > graph1.tr",
            "desc": "Extracts time and congestion window values for Flow 1 (n0 -> n8)."
          },
          {
            "cmd": "awk -f main.awk file2.tr > graph2.tr",
            "desc": "Extracts time and congestion window values for Flow 2 (n1 -> n6)."
          },
          {
            "cmd": "xgraph graph1.tr graph2.tr &",
            "desc": "Plots cwnd vs time graphs for both TCP flows using xgraph."
          }
        ],
        "tip": "AWK Syntax Tip: In main.awk line 5, use printf(\"%f\\t%f\\n\", $1, $7); instead of print(...) to format time ($1) and cwnd_ ($7) as clean tab-separated numerical columns for xgraph.",
        "expected": "done\nGenerated graph1.tr and graph2.tr for xgraph plotting."
      }
    },
    {
      "id": "partB-p1",
      "shortId": "b-p1",
      "part": "Part B",
      "category": "partB",
      "num": "Program 1",
      "title": "Bit Stuffing & Destuffing (Data Link Layer)",
      "badge": "Data Link \u2022 Framing \u2022 Python",
      "question": "Program to implement Bit Stuffing or Byte Stuffing concept in data link layer",
      "summary": "Implements bit stuffing and destuffing. Inserts a 0 bit after every five consecutive 1 bits at the transmitter to prevent unintended flag sequences, and strips the stuffed 0 bits at the receiver.",
      "hasTopology": false,
      "topology": null,
      "files": [
        {
          "name": "main.py",
          "lang": "python",
          "path": "partB/p1/main.py",
          "description": "Source file: main.py",
          "content": "# Experiment 5: Bit Stuffing and Destuffing\n# Concept: Insert a '0' after five consecutive '1's at the transmitter,\n# and remove that '0' at the receiver to maintain frame delineation.\n\ndef bit_stuffing(data):\n    stuffed_data = \"\"\n    count = 0\n    for bit in data:\n        stuffed_data += bit\n        if bit == '1':\n            count += 1\n            if count == 5:\n                stuffed_data += '0'\n                count = 0\n        else:\n            count = 0\n    return stuffed_data\n\n\ndef bit_destuffing(stuffed_data):\n    destuffed_data = \"\"\n    count = 0\n    skip_next = False\n    for bit in stuffed_data:\n        if skip_next:\n            skip_next = False\n            continue\n        destuffed_data += bit\n        if bit == '1':\n            count += 1\n            if count == 5:\n                skip_next = True\n                count = 0\n        else:\n            count = 0\n    return destuffed_data\n\n\n\ndata = input(\"Enter the input data :\")\nprint(\"Original data :\", data)\nstuffed = bit_stuffing(data)\nprint(\"Bit Stuffed data :\", stuffed)\ndestuffed = bit_destuffing(stuffed)\nprint(\"Bit Destuffed data :\", destuffed)"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "python3 main.py",
            "desc": "Execute the interactive bit stuffing and destuffing simulation."
          }
        ],
        "expected": "madvith@archlinux:~/cnc/partB/p1$ python3 main.py\nEnter the input data : 11111101\nOriginal data : 11111101\nBit Stuffed data : 111110101\nBit Destuffed data : 11111101"
      }
    },
    {
      "id": "partB-p2",
      "shortId": "b-p2",
      "part": "Part B",
      "category": "partB",
      "num": "Program 2",
      "title": "16-Bit CRC-CCITT Error Detecting Code",
      "badge": "Error Detection \u2022 CRC-CCITT \u2022 Python",
      "question": "Write a program for error detecting code using CRC-CCITT (16-bits).",
      "summary": "Implements 16-bit CRC error detection using the standard CRC-CCITT polynomial (x^16 + x^12 + x^5 + 1). Computes transmitted codeword, allows simulated bit corruption, and checks syndrome validity at receiver.",
      "hasTopology": false,
      "topology": null,
      "files": [
        {
          "name": "main.py",
          "lang": "python",
          "path": "partB/p2/main.py",
          "description": "Source file: main.py",
          "content": "div = [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1]\nm = len(div)\nn = int(input(\"Enter no of bits\"))\n\nprint(\"Enter the bits : \\n\")\nif n < m :\n    print(\"Invalid\")\n    exit()\ndata = []\nfor i in range(n) :\n    bit = int(input())\n    if bit not in [0 , 1]:\n        print(\"Invalid bit\")\n        exit()\n    else:\n        data.append(bit)\n\n\ncdata = data.copy() \nfor i in range(m - 1):\n    cdata.append(0)\nprint(\"Initial codeword : \", cdata)\n\nfor i in range(n):\n    if cdata[i] == 1 :\n        for j in range(m):\n            cdata[i+j]^=div[j]\nprint(cdata)\n\nfor i in range(n,n+m-1):\n    data.append(cdata[i])\n\nprint(\"Transmitted codeword :\" , data)\n\nchoice = 0\nprint(\"Choose : \\n1.Introduce Error \\n2.No error\")\nchoice = int(input())\nif choice == 1 :\n    p = int(input(\"Enter the position to indroduce error : \"))\n    if 1 <= p <= len(data):\n        data[p-1]^=1\n    else:\n        print(\"Invalid Position\")\nprint(\"Received message : \", data)\nreceived = data.copy()\nfor i in range(n) :\n        if data[i] == 1:\n            for j in range(m):\n                data[i+j]^=div[j]\n\nflag = True\n\nfor i in data:\n    if i == 1 :\n        flag=False\n        break\nif flag :\n    print(\"Valid data\")\n    print(\"Data bits : \")\n    print(received[0:n])\n   \nelse:\n     print(\"Invalid data\")\n   \n\n"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "python3 main.py",
            "desc": "Run the CRC calculation and interactive error detection test."
          }
        ],
        "expected": "madvith@archlinux:~/cnc/partB/p2$ python3 main.py\nEnter no of bits: 17\nEnter the bits : \n[Input 17 binary bits]\nInitial codeword : [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, ...]\nTransmitted codeword : [1, 0, 0, ...]\nChoose : \n1.Introduce Error \n2.No error\n2\nReceived message : [1, 0, ...]\nValid data\nData bits : \n[1, 0, ...]"
      }
    },
    {
      "id": "partB-p3",
      "shortId": "b-p3",
      "part": "Part B",
      "category": "partB",
      "num": "Program 3",
      "title": "Frame Sorting Technique for Network Buffers",
      "badge": "Buffer Management \u2022 Sequencing \u2022 Python",
      "question": "Write a program for frame sorting technique used in buffers.",
      "summary": "Simulates frame fragmentation into chunks with sequence numbers, models out-of-order network arrival by shuffling, and reassembles the original stream using buffer bubble sort.",
      "hasTopology": false,
      "topology": null,
      "files": [
        {
          "name": "main.py",
          "lang": "python",
          "path": "partB/p3/main.py",
          "description": "Source file: main.py",
          "content": "# Experiment 7: Frame Sorting Technique Used in Buffers\n# Concept: Packets in packet-switched networks traverse diverse paths and may arrive\n# out of order. Receiver buffers use sequence numbers to sort and reassemble data.\n\nimport random\n\nDATA_SZ = 3\n\n\ndef bubb_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n\n\nif __name__ == \"__main__\":\n    msg = input(\"Enter the message:\")\n    # Fragment message into chunks of DATA_SZ characters\n    msg_chunks = [msg[i:i + DATA_SZ] for i in range(0, len(msg), DATA_SZ)]\n\n    # Assign sequential frame sequence numbers starting from 1\n    frames = list(enumerate(msg_chunks, start=1))\n    print(\"Fragmented frames:\", frames)\n\n    # Simulate out-of-order network arrival by shuffling\n    for i in range(len(frames)):\n        j = random.randint(0, len(frames) - 1)\n        frames[i], frames[j] = frames[j], frames[i]\n    print(\"Shuffled frames:\", frames)\n\n    # Sort frames in receiver buffer by sequence number\n    bubb_sort(frames)\n    print(\"Sorted frames:\", frames)\n\n    # Reassemble original stream\n    print(\"Sorted message:\" + \"\".join(x[1] for x in frames))"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "python3 main.py",
            "desc": "Run the frame fragmentation, shuffle, and buffer reassembly demo."
          }
        ],
        "expected": "madvith@archlinux:~/cnc/partB/p3$ python3 main.py\nEnter the message: COMPUTERNETWORKS\nFragmented frames: [(1, 'COM'), (2, 'PUT'), (3, 'ERN'), (4, 'ETW'), (5, 'ORK'), (6, 'S')]\nShuffled frames: [(4, 'ETW'), (1, 'COM'), (6, 'S'), (2, 'PUT'), (5, 'ORK'), (3, 'ERN')]\nSorted frames: [(1, 'COM'), (2, 'PUT'), (3, 'ERN'), (4, 'ETW'), (5, 'ORK'), (6, 'S')]\nSorted message: COMPUTERNETWORKS"
      }
    },
    {
      "id": "partB-p4",
      "shortId": "b-p4",
      "part": "Part B",
      "category": "partB",
      "num": "Program 4",
      "title": "Distance Vector Routing Algorithm (Bellman-Ford)",
      "badge": "Network Layer \u2022 Bellman-Ford \u2022 C",
      "question": "Write a program for distance vector algorithm to find suitable path for transmission.",
      "summary": "Implements the Distance Vector Routing algorithm in C using the Bellman-Ford equation: D_x(y) = min_v { c(x,v) + D_v(y) }. Computes routing tables and optimal next-hops across routers.",
      "hasTopology": false,
      "topology": null,
      "files": [
        {
          "name": "main.c",
          "lang": "c",
          "path": "partB/p4/main.c",
          "description": "Source file: main.c",
          "content": "#include <stdio.h>\n\nstruct node {\n  int dist[20];\n  int from[20];\n} rt[10];\n\nint main() {\n  int dmat[20][20];\n  int n, i, j, k, count = 1;\n\n  printf(\"\\nEnter the number of nodes:\\n\");\n  scanf(\"%d\", &n);\n\n  printf(\"\\nEnter the cost matrix:\\n\");\n\n  for (i = 1; i <= n; i++) {\n    for (j = 1; j <= n; j++) {\n      scanf(\"%d\", &dmat[i][j]);\n\n      if (i == j)\n        dmat[i][j] = 0;\n\n      rt[i].dist[j] = dmat[i][j];\n      rt[i].from[j] = j;\n    }\n  }\n\n  do {\n    count = 0;\n\n    for (i = 1; i <= n; i++) {\n      for (j = 1; j <= n; j++) {\n        for (k = 1; k <= n; k++) {\n          if (rt[i].dist[j] > rt[i].dist[k] + rt[k].dist[j]) {\n            rt[i].dist[j] = rt[i].dist[k] + rt[k].dist[j];\n            rt[i].from[j] = k;\n            count = 1;\n          }\n        }\n      }\n    }\n\n  } while (count != 0);\n\n  for (i = 1; i <= n; i++) {\n    printf(\"\\nDistance Table for router %c is:\\n\", i + 64);\n\n    for (j = 1; j <= n; j++) {\n      printf(\"\\tNode %d Via %d, Distance: %d\\n\", j, rt[i].from[j],\n             rt[i].dist[j]);\n    }\n  }\n\n  return 0;\n}"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "gcc main.c -o dist_vector",
            "desc": "Compile the Distance Vector routing C source."
          },
          {
            "cmd": "./dist_vector",
            "desc": "Run the router distance table calculator."
          }
        ],
        "expected": "madvith@archlinux:~/cnc/partB/p4$ gcc main.c -o dist_vector && ./dist_vector\nEnter the number of nodes:\n3\nEnter the cost matrix:\n0 2 7\n2 0 1\n7 1 0\n\nDistance Table for router A is:\n\tNode 1 Via 1, Distance: 0\n\tNode 2 Via 2, Distance: 2\n\tNode 3 Via 2, Distance: 3\n\nDistance Table for router B is:\n\tNode 1 Via 1, Distance: 2\n\tNode 2 Via 2, Distance: 0\n\tNode 3 Via 3, Distance: 1\n\nDistance Table for router C is:\n\tNode 1 Via 2, Distance: 3\n\tNode 2 Via 2, Distance: 1\n\tNode 3 Via 3, Distance: 0"
      }
    },
    {
      "id": "partB-p5",
      "shortId": "b-p5",
      "part": "Part B",
      "category": "partB",
      "num": "Program 5",
      "title": "TCP Client-Server File Transfer Protocol",
      "badge": "Sockets \u2022 TCP / IP \u2022 Python",
      "question": "Using TCP/IP sockets, write a client-server program to make client sending the file name and the server to send back the contents of the requested file if present.",
      "summary": "Implements a client-server file transfer service using TCP sockets. The client sends the requested filename; the listening server reads the file from disk and streams bytes back to be saved locally.",
      "hasTopology": false,
      "topology": null,
      "files": [
        {
          "name": "client.py",
          "lang": "python",
          "path": "partB/p5/client.py",
          "description": "Source file: client.py",
          "content": "# tcp_client.py - requests a file from the server and saves it\nimport socket\nimport sys\nimport os\n\nSERVER_ADDRESS = (\"127.0.0.1\", 8888)  # (IP address, port) of the server\nBUFFER_SIZE = 1024\n\n# create a TCP socket and connect to the server\nclient_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ntry:\n    client_socket.connect(SERVER_ADDRESS)\nexcept ConnectionRefusedError:\n    sys.exit(\"Could not connect to the server. Is tcp_server.py running?\")\n\nfile_name = input(\"Enter the file name: \").strip()\nif file_name == \"\":\n    client_socket.close()\n    sys.exit(\"No file name entered.\")\n\n# send the file name, then read until the server closes the connection\nclient_socket.sendall(file_name.encode())\nfile_contents = b\"\"\nwhile True:\n    chunk = client_socket.recv(BUFFER_SIZE)\n    if not chunk:  # empty bytes: the server has closed\n        break\n    file_contents += chunk\nclient_socket.close()\n\nif file_contents == b\"File not found\":\n    print(\"File not found on the server.\")\nelse:\n    print(\"File contents:\")\n    print(file_contents.decode(errors=\"replace\"))\n    save_name = \"received_\" + os.path.basename(file_name)\n    with open(save_name, \"wb\") as file:\n        file.write(file_contents)\n    print(\"File received and saved as '\" + save_name + \"'\")"
        },
        {
          "name": "server.py",
          "lang": "python",
          "path": "partB/p5/server.py",
          "description": "Source file: server.py",
          "content": "# tcp_server.py - sends the requested file to the client\nimport socket\nimport os\n\nHOST = \"127.0.0.1\"  # this computer only (localhost)\nPORT = 8888  # port number the server listens on\nBUFFER_SIZE = 1024  # maximum bytes received by one recv()\n\n# create a TCP socket, bind it to (HOST, PORT) and start listening\nserver_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nserver_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\nserver_socket.bind((HOST, PORT))\nserver_socket.listen(1)\nprint(\"Server is listening on\", HOST, \"port\", PORT)\n\ntry:\n    while True:\n        client_socket, client_address = server_socket.accept()\n        with client_socket:\n            print(\"Accepted connection from\", client_address)\n\n            # receive the file name sent by the client\n            file_name = client_socket.recv(BUFFER_SIZE).decode()\n            print(\"Received file name =\", file_name)\n\n            # send the contents if the file exists, otherwise an error text\n            if os.path.isfile(file_name):\n                with open(file_name, \"rb\") as file:\n                    client_socket.sendall(file.read())\n                print(\"File sent\")\n            else:\n                client_socket.sendall(b\"File not found\")\n                print(\"File not found\")\nexcept KeyboardInterrupt:\n    print(\"\\nServer stopped\")\nfinally:\n    server_socket.close()"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "python3 server.py",
            "desc": "Terminal 1: Start the TCP server listener on 127.0.0.1:8888."
          },
          {
            "cmd": "python3 client.py",
            "desc": "Terminal 2: Run client, request a filename, and receive file contents."
          }
        ],
        "expected": "[Terminal 1 - Server]\nmadvith@archlinux:~/cnc/partB/p5$ python3 server.py\nServer is listening on 127.0.0.1 port 8888\nAccepted connection from ('127.0.0.1', 52348)\nReceived file name = sample.txt\nFile sent\n\n[Terminal 2 - Client]\nmadvith@archlinux:~/cnc/partB/p5$ python3 client.py\nEnter the file name: sample.txt\nFile contents:\nHello from Computer Networks Lab!\nFile received and saved as 'received_sample.txt'"
      }
    },
    {
      "id": "partB-p6",
      "shortId": "b-p6",
      "part": "Part B",
      "category": "partB",
      "num": "Program 6",
      "title": "UDP Client-Server Calculator Service",
      "badge": "Sockets \u2022 UDP Datagram \u2022 Python",
      "question": "Using UDP SOCKETS, write a client-server program to make the client sending two numbers and an operator, and server responding with the result. Display the result and appropriate messages for invalid inputs at the client side.",
      "summary": "Implements a client-server arithmetic expression evaluator using connectionless UDP sockets. The client sends an expression (e.g. 24*5); the server evaluates it and sends back the datagram result.",
      "hasTopology": false,
      "topology": null,
      "files": [
        {
          "name": "client.py",
          "lang": "python",
          "path": "partB/p6/client.py",
          "description": "Source file: client.py",
          "content": "import socket \n\nclientSocket = socket.socket(socket.AF_INET , socket.SOCK_DGRAM)\nexpression = input(\"Enter the expression\")\nclientSocket.sendto(expression.encode(), (\"127.0.0.1\" , 8081))\n\nresult , adress = clientSocket.recvfrom(1024)\n\nprint(f\"Result : {result.decode()}\")"
        },
        {
          "name": "server.py",
          "lang": "python",
          "path": "partB/p6/server.py",
          "description": "Source file: server.py",
          "content": "import socket\nimport re\nservSocket = socket.socket(socket.AF_INET , socket.SOCK_DGRAM)\n\nservSocket.bind((\"127.0.0.1\" , 8081))\nprint(\"UDP server started\")\nwhile True :\n    data , adress  = servSocket.recvfrom(1024)\n    expression = data.decode()\n    num1 , num2 = re.split('\\+|-|\\*|/|%' , expression)\n    num1 = float(num1)\n    num2 = float(num2)\n\n    result = 0\n    if '+' in expression :\n        result = num1 + num2\n    elif '-' in expression:\n        result = num1 - num2\n    elif '*' in expression:\n        result = num1 * num2\n    elif '/' in expression:\n        if num2 == 0:\n            result = \"Invalid\"\n        else:\n            result = num1 / num2\n    elif '%' in expression:\n        result = num1 % num2\n    else :\n        result = \"Invalid Expression\"\n    \n    print(f\"expression received from client {adress} : {expression}\")\n    print(f\"Calcultated result : {result}\")\n\n    servSocket.sendto(str(result).encode() , adress)\n\n\nservSocket.close()\n"
        }
      ],
      "execution": {
        "commands": [
          {
            "cmd": "python3 server.py",
            "desc": "Terminal 1: Start the UDP calculator server listener on port 8081."
          },
          {
            "cmd": "python3 client.py",
            "desc": "Terminal 2: Send math expression to evaluate over UDP."
          }
        ],
        "expected": "[Terminal 1 - Server]\nmadvith@archlinux:~/cnc/partB/p6$ python3 server.py\nUDP server started\n\n[Terminal 2 - Client]\nmadvith@archlinux:~/cnc/partB/p6$ python3 client.py\nEnter the expression: 24*5\nResult : 120.0"
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
        "content": "https://forum.garudalinux.org/t/network-animator-and-network-simulator-installation-script/26240\n"
      }
    ]
  },
  "traceGuide": {
    "title": "NS-2 Trace File (.tr) Anatomy & Cheat Sheet",
    "subtitle": "Detailed breakdown of the 12 fields logged for every packet event in out.tr",
    "fields": [
      {
        "col": "$1",
        "name": "Event",
        "desc": "Action performed: + (enqueued), - (dequeued), r (received), d (dropped)."
      },
      {
        "col": "$2",
        "name": "Time",
        "desc": "Simulation time in seconds when event occurred (e.g. 0.51032)."
      },
      {
        "col": "$3",
        "name": "From Node",
        "desc": "Node ID where packet originates / departs from."
      },
      {
        "col": "$4",
        "name": "To Node",
        "desc": "Next hop node ID receiving the packet."
      },
      {
        "col": "$5",
        "name": "Packet Type",
        "desc": "Protocol: tcp, ack, cbr, udp, rtProtoDV, etc. (Never \"ftp\" or application names!)."
      },
      {
        "col": "$6",
        "name": "Packet Size",
        "desc": "Size of the packet in bytes (e.g. 500, 40)."
      },
      {
        "col": "$7",
        "name": "Flags",
        "desc": "7-character string for ECN, priority flags (e.g. -------)."
      },
      {
        "col": "$8",
        "name": "Flow ID (fid)",
        "desc": "Class or flow identifier assigned in TCL via $agent set fid_ X."
      },
      {
        "col": "$9",
        "name": "Source Address",
        "desc": "node.port address format (e.g. 0.0 or 1.0)."
      },
      {
        "col": "$10",
        "name": "Dest Address",
        "desc": "node.port address format (e.g. 3.0 or 3.1)."
      },
      {
        "col": "$11",
        "name": "Sequence Num",
        "desc": "Packet sequence number maintained by transport agent."
      },
      {
        "col": "$12",
        "name": "Packet ID",
        "desc": "Unique identifier for the packet throughout the simulation."
      }
    ]
  }
};
