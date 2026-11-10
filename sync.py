#!/usr/bin/env python3
"""
CNC Laboratory Portal - Automatic Sync & Catalog Generator
Scans partA/p* and partB/p* directories, converts README.md into questions,
and packages all code files into data.js for the interactive website.
Supports NS-2 (Tcl/Awk) for Part A and Python network programs for Part B.
"""

import os
import re
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def read_text(path, fallback=''):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return fallback

def get_lang(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext == '.py': return 'python'
    if ext == '.tcl': return 'tcl'
    if ext == '.awk': return 'awk'
    if ext in ['.sh', '.bash']: return 'bash'
    if ext in ['.md', '.markdown']: return 'markdown'
    if ext in ['.c', '.h']: return 'c'
    if ext in ['.cpp', '.cc', '.cxx']: return 'cpp'
    if ext == '.java': return 'java'
    if ext == '.json': return 'json'
    return 'text'

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def build_catalog():
    programs = []

    # Known titles & definitions for standard Part A experiments
    partA_meta = {
        'p1': {
            'num': 'Program 1',
            'title': '3-Node Point-to-Point Network & Packet Drop Analysis',
            'badge': '3 Nodes • Point-to-Point • CBR/UDP',
            'summary': 'Simulate a 3-node linear topology with DropTail queues. CBR traffic is generated over UDP from node 0 to node 2 via router node 1. Observe and count packet drops when incoming traffic exceeds queue and bandwidth limits.',
            'topology': {
                'type': 'Point-to-Point (Linear)',
                'nodes': ['n0 (Source)', 'n1 (Router)', 'n2 (Sink)'],
                'links': [
                    {'from': 'n0', 'to': 'n1', 'bw': '500Kb', 'delay': '10ms', 'queue': 'DropTail (limit: 5)'},
                    {'from': 'n1', 'to': 'n2', 'bw': '500Kb', 'delay': '10ms', 'queue': 'DropTail (limit: 5)'}
                ],
                'agents': 'Agent/UDP on n0 connected to Agent/Null on n2',
                'traffic': 'Application/Traffic/CBR (packetSize: 500B, interval: 0.005s)'
            },
            'execution': {
                'commands': [
                    {'cmd': 'ns main.tcl', 'desc': 'Runs the simulation, outputs out.tr & out.nam, and launches Network Animator.'},
                    {'cmd': 'awk -f main.awk out.tr', 'desc': 'Parses the trace file and prints the number of dropped packets.'},
                    {'cmd': 'grep -c "^d" out.tr', 'desc': 'Alternative quick bash one-liner to verify total dropped packets.'}
                ],
                'expected': 'Number of packets dropped : 89'
            }
        },
        'p2': {
            'num': 'Program 2',
            'title': '4-Node TCP vs UDP Traffic & Throughput Analysis',
            'badge': '4 Nodes • TCP/FTP vs UDP/CBR',
            'summary': 'Simulate concurrent TCP (FTP) and UDP (CBR) traffic across an intermediate bottleneck node. Measures packet counts for each protocol and calculates overall throughput using AWK.',
            'topology': {
                'type': 'Star / Tree Bottleneck',
                'nodes': ['n0 (TCP Src)', 'n1 (UDP Src)', 'n2 (Bottleneck Router)', 'n3 (Shared Dest)'],
                'links': [
                    {'from': 'n0', 'to': 'n2', 'bw': '1Mb', 'delay': '10ms', 'queue': 'DropTail (limit: 50)'},
                    {'from': 'n1', 'to': 'n2', 'bw': '1Mb', 'delay': '10ms', 'queue': 'DropTail (limit: 50)'},
                    {'from': 'n2', 'to': 'n3', 'bw': '1Mb', 'delay': '10ms', 'queue': 'DropTail (limit: 50)'}
                ],
                'agents': 'TCP on n0 -> TCPSink on n3; UDP on n1 -> Null on n3',
                'traffic': 'FTP over TCP ($0.5s-$5.0s); CBR over UDP ($0.5s-$5.5s)'
            },
            'execution': {
                'commands': [
                    {'cmd': 'ns main.tcl', 'desc': 'Executes 4-node simulation, creates out.tr and out.nam, launches NAM.'},
                    {'cmd': 'awk -f main.awk out.tr', 'desc': 'Calculates packet counts and throughput.'}
                ],
                'tip': 'Why was TCP count 0? In NS-2 trace files, field $5 represents packet type: "tcp" or "cbr", never "ftp"! Checking $5 == "tcp" fixes the count.',
                'expected': 'No of tcp packets : 1240\nno of udp packet : 2509\nThroughput : 1797.38 Kbps'
            }
        },
        'p3': {
            'num': 'Program 3',
            'title': 'Ethernet LAN using N-Nodes (802.3 MAC) & Throughput',
            'badge': 'Ethernet LAN • 802.3 Bus • TCP/FTP',
            'summary': 'Simulate an Ethernet LAN connecting nodes n0-n7 over an 802.3 CSMA/CD shared medium (10Mb, 10ms), connected to destination node n8 via point-to-point duplex link. Measures throughput under varying conditions.',
            'topology': {
                'type': 'Bus LAN + Point-to-Point Gateway',
                'nodes': ['n0-n7 (Shared LAN Nodes)', 'n8 (Outside Gateway / Dest)'],
                'links': [
                    {'from': 'n0..n7', 'to': 'LAN Bus', 'bw': '10Mb', 'delay': '10ms', 'queue': 'LL Mac/802_3 Queue/DropTail'},
                    {'from': 'n7', 'to': 'n8', 'bw': '1Mb', 'delay': '10ms', 'queue': 'DropTail (limit: 50)'}
                ],
                'agents': 'Agent/TCP on n0 connected to Agent/TCPSink on n8',
                'traffic': 'Application/FTP over TCP from 0.5s to 5.0s'
            },
            'execution': {
                'commands': [
                    {'cmd': 'ns main.tcl', 'desc': 'Simulates Ethernet LAN transmission and animates CSMA/CD bus in NAM.'},
                    {'cmd': 'awk -f main.awk out.tr', 'desc': 'Computes LAN throughput from trace timestamps and packet sizes.'}
                ],
                'expected': 'Throughput : 1813.90'
            }
        },
        'p4': {
            'num': 'Program 4',
            'title': 'Ethernet LAN Multi-Traffic, Collisions & Congestion Window (cwnd)',
            'badge': 'Ethernet LAN • Congestion Window • 2 TCP Flows',
            'summary': 'Simulate an Ethernet LAN using N nodes with multiple simultaneous TCP traffic sources. Trace and extract TCP congestion window (cwnd_) dynamics to analyze window growth, timeouts, and collision avoidance.',
            'topology': {
                'type': 'Ethernet Bus LAN + Gateway Link',
                'nodes': ['Src1 (n0)', 'Src2 (n1)', 'n2..n5', 'Dst2 (n6)', 'Gateway (n7)', 'Dst1 (n8)'],
                'links': [
                    {'from': 'n0..n7', 'to': 'LAN Bus', 'bw': '10Mb', 'delay': '10ms', 'queue': 'LL Mac/802_3 Queue/DropTail'},
                    {'from': 'n7', 'to': 'n8', 'bw': '1Mb', 'delay': '1ms', 'queue': 'DropTail (limit: 5)'}
                ],
                'agents': 'TCP0 on n0 -> Sink1 on n8; TCP1 on n1 -> Sink2 on n6',
                'traffic': 'FTP0 (0.5s-5.0s, 5.5s-12.0s); FTP1 (1.0s-6.0s, 7.0s-13.0s)'
            },
            'execution': {
                'commands': [
                    {'cmd': 'ns main.tcl', 'desc': 'Executes simulation, outputs tracefile, and logs cwnd_ to file1.tr and file2.tr.'},
                    {'cmd': 'awk -f main.awk file1.tr > graph1.tr', 'desc': 'Extracts time and congestion window values for Flow 1 (n0 -> n8).'},
                    {'cmd': 'awk -f main.awk file2.tr > graph2.tr', 'desc': 'Extracts time and congestion window values for Flow 2 (n1 -> n6).'},
                    {'cmd': 'xgraph graph1.tr graph2.tr &', 'desc': 'Plots cwnd vs time graphs for both TCP flows using xgraph.'}
                ],
                'tip': 'AWK Syntax Tip: In main.awk line 5, use printf("%f\\t%f\\n", $1, $7); instead of print(...) to format time ($1) and cwnd_ ($7) as clean tab-separated numerical columns for xgraph.',
                'expected': 'done\nGenerated graph1.tr and graph2.tr for xgraph plotting.'
            }
        }
    }

    # Standard Part B VTU program metadata & fallback definitions
    partB_meta = {
        'p1': {
            'title': 'Bit Stuffing & Destuffing (Data Link Layer)',
            'badge': 'Data Link • Framing • Python',
            'summary': 'Implements bit stuffing and destuffing. Inserts a 0 bit after every five consecutive 1 bits at the transmitter to prevent unintended flag sequences, and strips the stuffed 0 bits at the receiver.',
            'commands': [
                {'cmd': 'python3 main.py', 'desc': 'Execute the interactive bit stuffing and destuffing simulation.'}
            ],
            'expected': "madvith@archlinux:~/cnc/partB/p1$ python3 main.py\nEnter the input data : 11111101\nOriginal data : 11111101\nBit Stuffed data : 111110101\nBit Destuffed data : 11111101"
        },
        'p2': {
            'title': '16-Bit CRC-CCITT Error Detecting Code',
            'badge': 'Error Detection • CRC-CCITT • Python',
            'summary': 'Implements 16-bit CRC error detection using the standard CRC-CCITT polynomial (x^16 + x^12 + x^5 + 1). Computes transmitted codeword, allows simulated bit corruption, and checks syndrome validity at receiver.',
            'commands': [
                {'cmd': 'python3 main.py', 'desc': 'Run the CRC calculation and interactive error detection test.'}
            ],
            'expected': "madvith@archlinux:~/cnc/partB/p2$ python3 main.py\nEnter no of bits: 17\nEnter the bits : \n[Input 17 binary bits]\nInitial codeword : [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, ...]\nTransmitted codeword : [1, 0, 0, ...]\nChoose : \n1.Introduce Error \n2.No error\n2\nReceived message : [1, 0, ...]\nValid data\nData bits : \n[1, 0, ...]"
        },
        'p3': {
            'title': 'Frame Sorting Technique for Network Buffers',
            'badge': 'Buffer Management • Sequencing • Python',
            'summary': 'Simulates frame fragmentation into chunks with sequence numbers, models out-of-order network arrival by shuffling, and reassembles the original stream using buffer bubble sort.',
            'commands': [
                {'cmd': 'python3 main.py', 'desc': 'Run the frame fragmentation, shuffle, and buffer reassembly demo.'}
            ],
            'expected': "madvith@archlinux:~/cnc/partB/p3$ python3 main.py\nEnter the message: COMPUTERNETWORKS\nFragmented frames: [(1, 'COM'), (2, 'PUT'), (3, 'ERN'), (4, 'ETW'), (5, 'ORK'), (6, 'S')]\nShuffled frames: [(4, 'ETW'), (1, 'COM'), (6, 'S'), (2, 'PUT'), (5, 'ORK'), (3, 'ERN')]\nSorted frames: [(1, 'COM'), (2, 'PUT'), (3, 'ERN'), (4, 'ETW'), (5, 'ORK'), (6, 'S')]\nSorted message: COMPUTERNETWORKS"
        },
        'p4': {
            'title': 'Distance Vector Routing Algorithm (Bellman-Ford)',
            'badge': 'Network Layer • Bellman-Ford • C',
            'summary': 'Implements the Distance Vector Routing algorithm in C using the Bellman-Ford equation: D_x(y) = min_v { c(x,v) + D_v(y) }. Computes routing tables and optimal next-hops across routers.',
            'commands': [
                {'cmd': 'gcc main.c -o dist_vector', 'desc': 'Compile the Distance Vector routing C source.'},
                {'cmd': './dist_vector', 'desc': 'Run the router distance table calculator.'}
            ],
            'expected': "madvith@archlinux:~/cnc/partB/p4$ gcc main.c -o dist_vector && ./dist_vector\nEnter the number of nodes:\n3\nEnter the cost matrix:\n0 2 7\n2 0 1\n7 1 0\n\nDistance Table for router A is:\n\tNode 1 Via 1, Distance: 0\n\tNode 2 Via 2, Distance: 2\n\tNode 3 Via 2, Distance: 3\n\nDistance Table for router B is:\n\tNode 1 Via 1, Distance: 2\n\tNode 2 Via 2, Distance: 0\n\tNode 3 Via 3, Distance: 1\n\nDistance Table for router C is:\n\tNode 1 Via 2, Distance: 3\n\tNode 2 Via 2, Distance: 1\n\tNode 3 Via 3, Distance: 0"
        },
        'p5': {
            'title': 'TCP Client-Server File Transfer Protocol',
            'badge': 'Sockets • TCP / IP • Python',
            'summary': 'Implements a client-server file transfer service using TCP sockets. The client sends the requested filename; the listening server reads the file from disk and streams bytes back to be saved locally.',
            'commands': [
                {'cmd': 'python3 server.py', 'desc': 'Terminal 1: Start the TCP server listener on 127.0.0.1:8888.'},
                {'cmd': 'python3 client.py', 'desc': 'Terminal 2: Run client, request a filename, and receive file contents.'}
            ],
            'expected': "[Terminal 1 - Server]\nmadvith@archlinux:~/cnc/partB/p5$ python3 server.py\nServer is listening on 127.0.0.1 port 8888\nAccepted connection from ('127.0.0.1', 52348)\nReceived file name = sample.txt\nFile sent\n\n[Terminal 2 - Client]\nmadvith@archlinux:~/cnc/partB/p5$ python3 client.py\nEnter the file name: sample.txt\nFile contents:\nHello from Computer Networks Lab!\nFile received and saved as 'received_sample.txt'"
        },
        'p6': {
            'title': 'UDP Client-Server Calculator Service',
            'badge': 'Sockets • UDP Datagram • Python',
            'summary': 'Implements a client-server arithmetic expression evaluator using connectionless UDP sockets. The client sends an expression (e.g. 24*5); the server evaluates it and sends back the datagram result.',
            'commands': [
                {'cmd': 'python3 server.py', 'desc': 'Terminal 1: Start the UDP calculator server listener on port 8081.'},
                {'cmd': 'python3 client.py', 'desc': 'Terminal 2: Send math expression to evaluate over UDP.'}
            ],
            'expected': "[Terminal 1 - Server]\nmadvith@archlinux:~/cnc/partB/p6$ python3 server.py\nUDP server started\n\n[Terminal 2 - Client]\nmadvith@archlinux:~/cnc/partB/p6$ python3 client.py\nEnter the expression: 24*5\nResult : 120.0"
        }
    }

    # 1. PROCESS PART A
    partA_dir = os.path.join(BASE_DIR, 'partA')
    if os.path.exists(partA_dir):
        dirs = sorted([d for d in os.listdir(partA_dir) if os.path.isdir(os.path.join(partA_dir, d)) and d.startswith('p')], key=natural_sort_key)
        for p_dir in dirs:
            p_path = os.path.join(partA_dir, p_dir)
            p_id = f"partA-{p_dir}"

            # Read README.md as the Question
            readme_text = read_text(os.path.join(p_path, 'README.md')).strip()
            if not readme_text:
                readme_text = f"Simulate Part A {p_dir.upper()} experiment."

            # Collect files
            files = []
            for f_name in sorted(os.listdir(p_path)):
                if f_name.startswith('.') or f_name in ['out.tr', 'out.nam', 'file1.tr', 'file2.tr', 'README.md']:
                    continue
                f_full = os.path.join(p_path, f_name)
                if os.path.isfile(f_full):
                    files.append({
                        'name': f_name,
                        'lang': get_lang(f_name),
                        'path': os.path.relpath(f_full, BASE_DIR),
                        'description': f'{f_name} script for {p_dir.upper()}',
                        'content': read_text(f_full)
                    })

            meta = partA_meta.get(p_dir, {
                'num': f'Program {re.search(r"\\d+", p_dir).group(0) if re.search(r"\\d+", p_dir) else p_dir}',
                'title': f'{p_dir.upper()} Network Simulation',
                'badge': f'Part A • {p_dir.upper()}',
                'summary': f'Simulation experiment {p_dir.upper()} under Part A.',
                'topology': {'type': 'Point-to-Point Topology', 'nodes': [], 'links': [], 'agents': '', 'traffic': ''},
                'execution': {'commands': [{'cmd': 'ns main.tcl', 'desc': 'Run NS-2 simulation.'}], 'expected': 'Execution completed'}
            })

            programs.append({
                'id': p_id,
                'shortId': p_dir,
                'part': 'Part A',
                'category': 'partA',
                'num': meta['num'],
                'title': meta['title'],
                'badge': meta['badge'],
                'question': readme_text,
                'summary': meta['summary'],
                'hasTopology': True,
                'topology': meta['topology'],
                'files': files,
                'execution': meta['execution']
            })

    # 2. PROCESS PART B (Python Network Programs - NO main requirement, NO topology)
    partB_dir = os.path.join(BASE_DIR, 'partB')
    if os.path.exists(partB_dir):
        # Auto-ensure folders p1..p6 exist
        for i in range(1, 7):
            sub_folder = os.path.join(partB_dir, f'p{i}')
            if not os.path.exists(sub_folder):
                try:
                    os.makedirs(sub_folder, exist_ok=True)
                except Exception:
                    pass

        dirs = sorted([d for d in os.listdir(partB_dir) if os.path.isdir(os.path.join(partB_dir, d)) and d.startswith('p')], key=natural_sort_key)
        for p_dir in dirs:
            p_path = os.path.join(partB_dir, p_dir)
            p_id = f"partB-{p_dir}"
            p_num_str = re.search(r'\d+', p_dir).group(0) if re.search(r'\d+', p_dir) else p_dir

            meta = partB_meta.get(p_dir, {
                'title': f'Program {p_num_str}: Network Implementation',
                'badge': f'Part B • P{p_num_str}',
                'summary': f'Part B experiment {p_num_str}.',
                'commands': [{'cmd': 'python3 main.py', 'desc': 'Run the script.'}],
                'expected': f'Program {p_num_str} executed successfully.'
            })

            # Read README.md / REAME.md as the Question
            readme_candidates = ['README.md', 'REAME.md', 'readme.md', 'README.txt']
            raw_readme = ''
            for rc in readme_candidates:
                rc_path = os.path.join(p_path, rc)
                if os.path.isfile(rc_path):
                    raw_readme = read_text(rc_path).strip()
                    break

            if raw_readme:
                readme_text = raw_readme
            else:
                readme_text = f"Write a program to implement {meta['title']}."

            title = meta['title']

            # Collect all code files (.py, .c, etc. - no fixed filename required!)
            files = []
            dir_contents = sorted(os.listdir(p_path))
            for f_name in dir_contents:
                if f_name.startswith('.') or f_name.lower() in ['readme.md', 'reame.md', 'readme.txt', '__pycache__', '.pytest_cache']:
                    continue
                f_full = os.path.join(p_path, f_name)
                if os.path.isfile(f_full):
                    content = read_text(f_full)
                    # If empty file on disk, provide helpful stub
                    if not content.strip() and f_name.endswith('.py'):
                        content = f'# {f_name}\n# Implementation for Part B Program {p_num_str}: {title}\n\ndef main():\n    print("Program {p_num_str} executed successfully.")\n\nif __name__ == "__main__":\n    main()\n'
                    files.append({
                        'name': f_name,
                        'lang': get_lang(f_name),
                        'path': os.path.relpath(f_full, BASE_DIR),
                        'description': f'Source file: {f_name}',
                        'content': content
                    })

            # If folder has no code files at all, provide starter file
            if not files:
                files.append({
                    'name': 'main.py',
                    'lang': 'python',
                    'path': f'partB/{p_dir}/main.py',
                    'description': f'Starter Python file for Program {p_num_str}',
                    'content': f'# Part B - Program {p_num_str}: {title}\n# Place your implementation files in partB/{p_dir}/\n\ndef main():\n    print("Program {p_num_str} ready for implementation")\n\nif __name__ == "__main__":\n    main()\n'
                })

            programs.append({
                'id': p_id,
                'shortId': f"b-{p_dir}",
                'part': 'Part B',
                'category': 'partB',
                'num': f'Program {p_num_str}',
                'title': title,
                'badge': meta['badge'],
                'question': readme_text,
                'summary': meta['summary'],
                'hasTopology': False,  # NO topology visualization as requested!
                'topology': None,
                'files': files,
                'execution': {
                    'commands': meta['commands'],
                    'expected': meta['expected']
                }
            })

    # Setup & Reference
    script_sh = read_text(os.path.join(BASE_DIR, 'script.sh'))
    setup_arch = read_text(os.path.join(BASE_DIR, 'SETUP_ARCH.md'))

    setup_obj = {
        'title': 'NS-2 & NAM Arch Linux Installation',
        'subtitle': 'Automated script and dependencies for NS-2.35 and NAM-1.15 on Arch Linux / Garuda / Manjaro',
        'files': [
            {
                'name': 'script.sh',
                'lang': 'bash',
                'path': 'script.sh',
                'description': 'Automated bash script to install yay, GCC 4.8, libx11, libxmu, build and link NS-2.35 and NAM-1.15.',
                'content': script_sh
            },
            {
                'name': 'SETUP_ARCH.md',
                'lang': 'markdown',
                'path': 'SETUP_ARCH.md',
                'description': 'Community guide reference link for Garuda / Arch Linux NS-2 build troubleshooting.',
                'content': setup_arch
            }
        ]
    }

    trace_guide_obj = {
        'title': 'NS-2 Trace File (.tr) Anatomy & Cheat Sheet',
        'subtitle': 'Detailed breakdown of the 12 fields logged for every packet event in out.tr',
        'fields': [
            {'col': '$1', 'name': 'Event', 'desc': 'Action performed: + (enqueued), - (dequeued), r (received), d (dropped).'},
            {'col': '$2', 'name': 'Time', 'desc': 'Simulation time in seconds when event occurred (e.g. 0.51032).'},
            {'col': '$3', 'name': 'From Node', 'desc': 'Node ID where packet originates / departs from.'},
            {'col': '$4', 'name': 'To Node', 'desc': 'Next hop node ID receiving the packet.'},
            {'col': '$5', 'name': 'Packet Type', 'desc': 'Protocol: tcp, ack, cbr, udp, rtProtoDV, etc. (Never "ftp" or application names!).'},
            {'col': '$6', 'name': 'Packet Size', 'desc': 'Size of the packet in bytes (e.g. 500, 40).'},
            {'col': '$7', 'name': 'Flags', 'desc': '7-character string for ECN, priority flags (e.g. -------).'},
            {'col': '$8', 'name': 'Flow ID (fid)', 'desc': 'Class or flow identifier assigned in TCL via $agent set fid_ X.'},
            {'col': '$9', 'name': 'Source Address', 'desc': 'node.port address format (e.g. 0.0 or 1.0).'},
            {'col': '$10', 'name': 'Dest Address', 'desc': 'node.port address format (e.g. 3.0 or 3.1).'},
            {'col': '$11', 'name': 'Sequence Num', 'desc': 'Packet sequence number maintained by transport agent.'},
            {'col': '$12', 'name': 'Packet ID', 'desc': 'Unique identifier for the packet throughout the simulation.'}
        ]
    }

    full_catalog = {
        'programs': programs,
        'setup': setup_obj,
        'traceGuide': trace_guide_obj
    }

    output_path = os.path.join(BASE_DIR, 'data.js')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('// Auto-generated data file for CNC Lab Portal\n')
        f.write('// Run ./sync.py whenever you add or edit files in partA/ or partB/\n')
        f.write('window.CNC_DATA = ' + json.dumps(full_catalog, indent=2) + ';\n')

    partA_count = len([p for p in programs if p['category'] == 'partA'])
    partB_count = len([p for p in programs if p['category'] == 'partB'])
    print(f'✅ Successfully synchronized {len(programs)} programs (Part A: {partA_count}, Part B: {partB_count}) into {output_path}!')

if __name__ == '__main__':
    build_catalog()
