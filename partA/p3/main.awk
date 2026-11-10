BEGIN{

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

	if(event == "r"){
		if(time > stopTime){
			stopTime = time;
		}

		sSize += size;
	}


}
END{
	tput =  (sSize / (stopTime - startTime)) * (8 / 1000);
	printf("Throughput : %.2f ", tput);
}
