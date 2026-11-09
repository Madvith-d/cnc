# CNC — Computer Networks Laboratory (VTU / NS-2.35)

> An interactive laboratory portal and code repository for Network Simulator 2 (NS-2) and AWK trace analysis programs.

---

## 🌐 Interactive Website

This repository includes a standalone, self-contained interactive website (`index.html`) featuring:
* **Question Presentation:** The `README.md` from each lab program is automatically rendered as the prominent **Problem Statement / Question**.
* **High-Fidelity Code Viewer:** Full syntax highlighting for **Tcl**, **AWK**, and **Bash** scripts with line numbers, copy-to-clipboard, and direct file download.
* **Network Topology Diagrams:** Bespoke interactive SVG diagrams showing node layouts, link capacities, delays, and queue limits.
* **Execution & Output Guide:** Step-by-step terminal execution commands and expected outputs.
* **NS-2 Trace Cheat Sheet:** Detailed breakdown of the 12 fields logged in `out.tr`.
* **Dark Obsidian & Light Editorial Themes:** Instant toggle with persistence.

### How to Run the Website Locally

You can open the website in any browser immediately without installing any build tools:

```bash
# Option 1: Using Python's built-in web server
python3 -m http.server 8000
# Then visit: http://localhost:8000 in your browser

# Option 2: Directly open index.html in your browser
xdg-open index.html   # Linux
open index.html       # macOS
```

You can also host it on **GitHub Pages** for free under **Repository Settings → Pages → Deploy from branch (main / root)**.

---

## 📂 Laboratory Programs (Part A)

### Program 1: 3-Node Point-to-Point Network & Packet Drop Analysis
* **Question:** *Simulate a three nodes point-to-point network with duplex links between them. Set the queue size, vary the bandwidth and find the number of packets dropped.*
* **Directory:** [`partA/p1/`](partA/p1/)
* **Files:**
  * [`main.tcl`](partA/p1/main.tcl): NS-2 simulation script ($n_0 \to n_1 \to n_2$) with DropTail queues.
  * [`main.awk`](partA/p1/main.awk): Filters dropped packets where event `$1 == "d"`.
* **Execution:**
  ```bash
  cd partA/p1
  ns main.tcl
  awk -f main.awk out.tr
  ```

---

### Program 2: 4-Node TCP vs UDP Traffic & Throughput Analysis
* **Question:** *Simulate a four node point-to-point network, and connect the links as follows: n0-n2, n1-n2 and n2-n3. Apply TCP agent between n0-n3 and UDP n1-n3. Apply relevant applications over TCP and UDP agents changing the parameter and determine the number of packets by TCP/UDP and analyse the throughput.*
* **Directory:** [`partA/p2/`](partA/p2/)
* **Files:**
  * [`main.tcl`](partA/p2/main.tcl): Dual-source simulation (FTP over TCP on $n_0 \to n_3$, CBR over UDP on $n_1 \to n_3$).
  * [`main.awk`](partA/p2/main.awk): Counts packets and calculates throughput.
* **Note on Packet Type:** In NS-2 trace files, field `$5` represents transport protocol (`"tcp"` or `"cbr"`), not the application name (`"ftp"`). Checking `$5 == "tcp"` ensures accurate TCP packet counting.
* **Execution:**
  ```bash
  cd partA/p2
  ns main.tcl
  awk -f main.awk out.tr
  ```

---

### Program 3: Ethernet LAN using N-Nodes (802.3 MAC) & Throughput
* **Question:** *Simulate an Ethernet LAN using N-nodes (6-10), change data rate and compare the throughput.*
* **Directory:** [`partA/p3/`](partA/p3/)
* **Files:**
  * [`main.tcl`](partA/p3/main.tcl): Configures an 8-node 802.3 CSMA/CD LAN using `$ns make-lan` linked to destination node $n_8$.
  * [`main.awk`](partA/p3/main.awk): Calculates aggregate LAN throughput in Kbps.
* **Execution:**
  ```bash
  cd partA/p3
  ns main.tcl
  awk -f main.awk out.tr
  ```

---

## 🛠️ Environment Setup (Arch Linux / Garuda / Manjaro)

Automated script [`script.sh`](script.sh) is provided to install GCC 4.8 and build **NS-2.35** and **NAM-1.15**:

```bash
chmod +x script.sh
./script.sh
```

See [`SETUP_ARCH.md`](SETUP_ARCH.md) for community documentation and troubleshooting tips.

