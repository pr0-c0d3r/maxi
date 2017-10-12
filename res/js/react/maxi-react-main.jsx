var log=console.log;
$(document).ready(()=>{
	$('a').click((e)=>e.preventDefault());
	$('form').on('submit',(e)=>e.preventDefault());
	Promise.all(['/api/v1/shops','/api/v1/offers','/api/v1/categories'].map(doFetch)).then(([shops,offers,categories])=>{
		showContent(<MaxiOffersPage offers={offers} shops={shops} categories={categories}/>);
	}).catch(unsafeErrorDisplay);
});

function doFetch(url){
	return fetch(url).then((resp)=>{
		if(resp.status!==200){
			return resp.text().then((text)=>{
				throw 'Error: fetch failed with status ' + resp.status + ' <br> Body: <br>' + text;
			});
		}else{
			return resp.json().then((result)=>{
				return result.response;
			},(e)=>{
				log(e);
				throw e;
			});
		}
	});
}

function unsafeErrorDisplay(e){
	var errorDescription = {"__html":e};
	showContent(
		(<div>
			<h3>Error occured</h3>
	  		<p dangerouslySetInnerHTML={errorDescription}/>
  		</div>)
	);
}

function showContent(data){
	ReactDOM.render(
		data,
	  	document.getElementById('content')
	);
}
