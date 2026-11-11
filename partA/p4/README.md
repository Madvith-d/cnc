Simulate an Ethernet LAN using N nodes and set multiple traffic nodes and determine collision across different nodes, also plot congestion window for different source/destination.

Steps to generate graph:
1. `ns main.tcl`
2. `awk -f main.awk file1.tr > a`
3. `awk -f main.awk file2.tr > b`
4. `xgraph a b &`
