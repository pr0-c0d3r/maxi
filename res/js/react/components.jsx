
class MaxiOffersPage extends React.Component{
	constructor(props){
		super(props);
		this.offersById = props.offers.reduce((p,c)=>{p[c.id]=c;return p;},{});
		this.shopsById = props.shops.reduce((p,c)=>{p[c.id]=c;return p;},{});
		this.categoriesById = props.categories.reduce((p,c)=>{p[c.id]=c;return p;},{});
		this.openOfferPage = this.openOfferPage.bind(this);
		this.closeOfferPage = this.closeOfferPage.bind(this);
		this.saveCategories = this.saveCategories.bind(this);
		this.openCategoriesSelection = this.openCategoriesSelection.bind(this);
		this.openSortingSelection = this.openSortingSelection.bind(this);
		this.closeSortingPage = this.closeSortingPage.bind(this);
		this.paginate = this.paginate.bind(this);
		this.state = {
			page: "list",
			categories:[],
			search:'',
			order:'',//price,title,discount
			orderDirection:'',
			offset:0
		};
	}
	openOfferPage(id){
		this.setState({
			page:"offer",
			offerId:id
		});
	}
	closeOfferPage(){
		this.setState({
			page:'list',
			offerId:null
		});
	}
	openCategoriesSelection(){
		this.setState({
			page:'categorySelection'
		});
	}
	openSortingSelection(){
		this.setState({
			page:'sortingSelection'
		});	
	}
	closeSortingPage(){
		this.setState({
			page:'list'
		});
	}
	saveCategories(categories){
		this.setState({
			categories:categories,
			page:'list',
			offset:0
		});
	}
	paginate(items){
		var offset = this.state.offset + items;
		if(offset>=this.itemsCount){
			offset -=10;
		}
		if(offset<0){
			offset=0;
		}
		
		this.setState({
			offset:offset
		});
	}
	render(){
		switch(this.state.page){
			case "list" : 
				var [items,itemsCount] = filterOffers(this.props.offers,this.state,30);
				this.itemsCount = itemsCount;
				return <OffersListPage
							items={items} 
							openOfferPage={this.openOfferPage} 
							openCategoriesSelection={this.openCategoriesSelection}
							openSortingSelection={this.openSortingSelection}
							search={this.state.search}
							setSearch={(search)=>this.setState({search:search,offset:0})}
							paginate={this.paginate}/>;
			case "categorySelection" :
				return <CategorySelectionPage categories={this.props.categories} saveCategories={this.saveCategories} selectedCategories={this.state.categories} categoriesById={this.categoriesById}/>;
			case "sortingSelection" :
				return <SortingSelection 
									setSorting={(order,orderDirection)=>this.setState({order:order,orderDirection:orderDirection})} 
									closeSortingPage={this.closeSortingPage}
									order={this.state.order} 
									orderDirection={this.state.orderDirection}/>
			case "offer" :
				return <OfferPage closeOfferPage={this.closeOfferPage} offer={this.offersById[this.state.offerId]} shopsById={this.shopsById}/>;
			default : throw 'Unknown page type';
		}
	}
}

function filterOffers(array,settings,pageSize){
	if(settings.categories.length>0){
		array = array.filter((offer)=>{
			return settings.categories.indexOf(offer.category_id)>-1;
		});
	}
	if(settings.search){
		array = array.filter((offer)=>{
			return offer.title.indexOf(settings.search)>-1;
		});
	}

	if(settings.order){
		array = array.sort((offer1,offer2)=>{
			var value1 = offer1[settings.order];
			var value2 = offer2[settings.order];
			return (value1===value2)
							? 0
							: xor(value1<value2,settings.orderDirection === 'desc')
									? -1
									: 1;
		});
	}

	return [array.slice(settings.offset,settings.offset + pageSize),array.length];
}

function xor(a,b){
	return !a && b || !b && a;
}

class OffersMenu extends React.Component{
	constructor(props){
		super(props);
		this.state={
			search:props.search
		};
	}
	render(){
		return (
			<div class="offers-list-menu">
				<span class="offers-list-menu-pagination">
					<img class="offers-list-menu-pagination-left" src="/res/img/react/icons/paginate-left-icon.png" onClick={()=>this.props.paginate(-10)}/>
					<img class="offers-list-menu-pagination-right" src="/res/img/react/icons/paginate-right-icon.png" onClick={()=>this.props.paginate(10)}/>
				</span>
				<div class="offers-list-menu-buttons"> 
					<img class="offers-list-menu-filter-button" src="/res/img/react/icons/filter-icon.png" onClick={this.props.openCategoriesSelection}/>
					<img class="offers-list-menu-sort-button"src="/res/img/react/icons/sort-icon.png" onClick={this.props.openSortingSelection}/>
					<input className={"offers-list-menu-search-input" + ((this.state.search)?' expanded':'')} 
							value={this.state.search} ref={(i)=>this.input=i} 
							onChange={(event)=>this.setState({search:event.target.value})}
							onKeyPress={(event)=>{if(event.key==='Enter'){this.props.setSearch(this.state.search)}}}/>
					<img class="offers-list-menu-search-button"src="/res/img/react/icons/search-icon.png" onClick={()=>this.input.focus()}/>
				</div>
			</div>
		);
	}
}

class OffersListPage extends React.Component{
	render(){
		return (
			<div>
				<OffersMenu 
					openCategoriesSelection={this.props.openCategoriesSelection} 
					openSortingSelection={this.props.openSortingSelection}
					search={this.props.search} 
					setSearch={this.props.setSearch}
					paginate={this.props.paginate}/>
				<OffersList items={this.props.items} openOfferPage={this.props.openOfferPage}/>
			</div>
		);
	}
}

class OffersList extends React.Component{
	render(){
		return (
			<div>
				{this.props.items.map((i)=><OfferItem item={i} openOfferPage={this.props.openOfferPage} page="list"/>)}
			</div>
		);
	}
}

class OfferItem extends React.Component{
	render(){
		var item = this.props.item;
		return (
			<div className="offer-item clear-both" onClick={()=>{
					if(this.props.page==='list'){
						this.props.openOfferPage(this.props.item.id);
				}}}>
				<img className="offer-item-image" src={item.image}/>
				<span className="offer-item-title">{item.title}</span><br/>
				<span className="offer-item-in-stores">Во всех магазинах</span><br/>
				<span className="offer-item-timespan">Действует с {formatDate(item.date_start)} до {formatDate(item.date_end)}.</span>
				<div className="clear-both"/>
				<OfferItemPrice price={item.price_new} chips={item.chips}/>
				<div className="clear-both"/>
				<span class="offer-item-buttons">
					<img src="/res/img/react/icons/i-icon.png"/>
					<img class="offer-item-add-icon" src="/res/img/react/icons/add-icon.png"/>
				</span>
			</div>
		);
	}
}

class OfferItemPrice extends React.Component{
	render(){
		return (
			<div className="offer-item-price">
				от {Math.floor(this.props.price)}<sup>{Math.floor(this.props.price%1*100).toString().padStart(2,'0')}</sup>+<span className="offer-item-price-chips">{this.props.chips}</span>
				<img src="/res/img/react/icons/coins-icon.png"/>
			</div>
		);
	}
}

class CategorySelectionPage extends React.Component{
	constructor(props){
		super(props);
		this.state=props.categories.map((c)=>c.id).reduce((p,c)=>{
			p[c]=props.selectedCategories.indexOf(c)>-1;
			return p;
		},{});
		this.onCategoryToggle=this.onCategoryToggle.bind(this);
		this.saveCategories = ()=>props.saveCategories(Object.entries(this.state).filter(([id,checked])=>checked).map(([id])=>parseInt(id)));
	}
	onCategoryToggle(event){
		this.setState({
			[event.target.value]:event.target.checked
		});
	}
	render(){
		return (
			<div>
				<div onClick={this.saveCategories}>SAVE</div><br/>
				{Object.entries(this.state).map(([id,checked])=>(
					<label>
						<input type="checkbox" value={id} checked={checked} onChange={this.onCategoryToggle}/>
						{this.props.categoriesById[id].name}
						<br/>
					</label>
				))}
			</div>
		);
	}
}

class SortingSelection extends React.Component{
	setSorting(order){
		this.props.setSorting(order,(order===this.props.order && this.props.orderDirection==='asc')?'desc':'asc');
	}
	render(){
		var getSortingIcon = (type)=>{
			return (this.props.order===type)
								? (this.props.orderDirection === 'asc')
											? 'arrow-up-icon.png'
											: 'arrow-down-icon.png'
								: 'sort-icon.png';
		};	
		return (
			<div className="sorting-page-wrap">
				<span onClick={this.props.closeSortingPage}>&lt;&lt; SAVE</span><br/><br/>
				<div onClick={()=>this.setSorting('price_new')}><img src={"/res/img/react/icons/"+getSortingIcon('price_new')}/>По цене</div>
				<div onClick={()=>this.setSorting('title')}><img src={"/res/img/react/icons/"+getSortingIcon('title')}/>По названию</div>
				<div><img src={"/res/img/react/icons/"+getSortingIcon('discount')}/>По скидке(непонятно)</div>
			</div>
		);
	}
}

class OfferPage extends React.Component{
	render(){
		return (
			<div>
				<span onClick={this.props.closeOfferPage}>&lt;&lt; Close</span>
				<OfferItem item={this.props.offer} page="offer"/>
				<FoldableParagraph title="АКЦИЯ ДЕЙСТВУЕТ В МАГАЗИНАХ">
					{this.props.offer.shops.map((s)=><ShopLink shop={this.props.shopsById[s]}/>)}
				</FoldableParagraph>
				<FoldableParagraph title="УСЛОВИЯ АКЦИИ">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras consectetur ante vitae nulla dictum, sed ultrices leo accumsan. Nam hendrerit tempus odio, sit amet bibendum metus finibus et. In ut congue sapien, ut laoreet dolor. Vivamus ut malesuada mauris. Nullam quis massa vel lacus pharetra blandit id a purus. Vivamus lobortis tristique lacus, eget varius lacus sagittis ut. Duis blandit ullamcorper nulla, non interdum mi sollicitudin sit amet. Etiam a sapien dui.
					<br/><br/>
					Pellentesque aliquet id massa in rhoncus. Maecenas diam ex, viverra nec elementum id, egestas sit amet elit. Aenean venenatis ligula ante, a placerat tortor condimentum dignissim. Phasellus laoreet tempus pulvinar. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vel lectus lectus. Nunc egestas lacinia neque, sed vestibulum nisl sodales et. Duis dolor dolor, posuere posuere euismod id, imperdiet eu ex.
					<br/><br/>
					Vestibulum et volutpat leo. Nam ut nibh egestas, sagittis diam quis, sagittis velit. Nulla at viverra libero. Nunc consequat non diam eget luctus. Donec eget tincidunt lectus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In convallis tempus placerat. Morbi mattis lectus vitae ante lobortis, id vehicula magna facilisis. Proin et nunc interdum, lobortis odio non, pulvinar felis. Cras aliquet nisi elit, ac porttitor quam convallis maximus. Morbi congue eleifend urna quis consectetur. Curabitur dapibus venenatis nisl, non vulputate nisl euismod a. Aliquam porttitor ullamcorper libero vel semper. Phasellus vel auctor arcu, in dapibus ipsum. Nullam eleifend, sapien commodo semper imperdiet, velit neque viverra ante, sed egestas nisl risus quis dui.
				</FoldableParagraph>
			</div>
		);
	}
}

class ShopLink extends React.Component{
	render(){
		var potentialHref = '/shops/'+this.props.shop.id;
		return <a className="shop-link">Супермаркет, {this.props.shop.address}</a>
	}
}

class FoldableParagraph extends React.Component{
	constructor(props){
		super(props);
		this.toggle=this.toggle.bind(this);
		this.state = {expanded:false};
	}
	render(){
		return (
			<div className={'foldable-paragraph-wrapper ' + (this.state.expanded?'foldable-paragraph-expanded':'')}>
				<div className="foldable-paragraph-title" onClick={this.toggle}>
					{this.props.title}
					<img src="/res/img/react/icons/expand-arrow-icon.png"/>
				</div>
				<div className="foldable-paragraph-body">{this.props.children}</div>
			</div>
		);
	}
	toggle(){
		this.setState({
			expanded:!this.state.expanded
		});
	}
}

class OfferAvailableInStores extends React.Component{
	render(){
		return (
			<div/>
		);
	}
}