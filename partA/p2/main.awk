BEGIN{
	ntcp = 0;
	nudp = 0;
	sSize = 0;
	startTime = 0;
	stopTime = 0;
	tput = 0;
}
{
	type = $5;
	event = $1;
	time = $2;
	size = $6;

	if(event == "+"){
		if(time < startTime){
			startTime = time;
		}
	}

	if(event == "+"){
		if(time > stopTime){
			stopTime = time;
		}

		sSize += size;
	}

	if(type == "tcp"){
		ntcp++;
	}
	if(type == "cbr"){
		nudp++;
	}
}
END{
	tput =  (sSize / (stopTime - startTime)) * (8 / 1000);
	printf("No of tcp packets : %d \n", ntcp);
	printf("no of udp packet : %d \n",nudp);
	printf("Throughput : %.2f ", tput);
}
