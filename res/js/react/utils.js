function formatDate(secondsSinceEpoch){
	var date = new Date(secondsSinceEpoch*1000);
	return [
		date.getDate(),
		date.getMonth()+1,
		date.getFullYear()
	].map((c)=>c.toString().substring(c.length-2,c.length).padStart(2,'0')).join('.');
}