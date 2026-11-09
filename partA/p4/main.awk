BEGIN{
}
{
if($6=="cwnd_")
print("%f\t\t%f\n",$1,$7);
}
END{
}
