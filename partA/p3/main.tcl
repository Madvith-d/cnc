set ns [new Simulator]

# Create trace files
set nf [open out.nam w]
$ns namtrace-all $nf

set tf [open out.tr w]
$ns trace-all $tf

# Finish procedure
proc finish {} {
    global ns nf tf

    $ns flush-trace
    close $nf
    close $tf

    exec nam out.nam &
    exit 0
}


set n0 [$ns node]
set n1 [$ns node]
set n2 [$ns node]
set n3 [$ns node]
set n4 [$ns node]
set n5 [$ns node]
set n6 [$ns node]
set n7 [$ns node]
set n8 [$ns node]

$ns duplex-link $n7 $n8 1Mb 10ms DropTail
$ns queue-limit $n7 $n8 50

$ns make-lan "$n0 $n1 $n2 $n3 $n4 $n5 $n6 $n7" 10Mb 10ms LL Queue/DropTail Mac/802_3

set tcp [new Agent/TCP]
$ns attach-agent $n0 $tcp
set tcpSink [new Agent/TCPSink]
$ns attach-agent $n8 $tcpSink
$ns connect $tcp $tcpSink

set ftp [new Application/FTP]
$ftp attach-agent $tcp

$ns at 0.5 "$ftp start"
$ns at 5.0 "$ftp stop"

$ns at 5.0 "finish"
$ns run
