let productData;
let cost = 0;
let selectedItems = [];
let discount, discountDays;
let discountAmt = 0;

$(document).ready(async function(){
    await populateItems();
    showLocations();
    itemClickListener();
    formListener();
    deliveryListener();
    }
)

async function populateItems(){
    await fetch('./product.json')
        .then(res => res.json())
        .then(data => {productData = data;});

    discount = Number(productData.discounts.rate);
    discountDays = productData.discounts.days;
    $('#discounttitle').html(`Discount(${discount*100}%)`);

    $('.products').append(
        `<div class="title">${productData.title}</div>`
    )

    for(let i = 0; i< productData.products.length; i++){
        $('.products').append(
            `<div class="product">
            <div class="category">${productData.products[i].category}</div>
            <div class="itembox"></div>
            </div>`
        )
        for(let j = 0; j < productData.products[i].items.length; j++){
            $('.itembox').eq(i).append(
                `<div class="card">
                <div class="photo">
                    <img src="${productData.products[i].items[j].img}" />
                    <div class="price"><span>Ks</span> <span class="priceAmt"> ${productData.products[i].items[j].price} </span></div>
                </div>
                <div class="detail">
                  <div class="pname">${productData.products[i].items[j].pname}</div>
                  <div class="code">${productData.products[i].items[j].pcode}</div>
                </div>
              </div>`)
        }
    }
}

function showLocations(){
    for(key in productData.locations){
        $('#delivery').append(
            `<option value="${productData.locations[key]}">${key} (+${productData.locations[key]} Ks)</option>`
        )
    }
}

function itemClickListener(){
    $('.card').mouseup((e)=>{

        if($('.cart').css('display') === 'none') $('.cart').slideDown();

        let card = e.currentTarget; // The card

        if(selectedItems.includes(card)){
            // If already included, updates the number, price and cost.
            let index = selectedItems.indexOf(card);
            $('.itemNum').eq(index).val(Number($('.itemNum').eq(index).val())+1)
            updatePrice(index);

        } else {
            // If note included, a new node is added and cost updated.
            selectedItems.push(card);
            let price = (Number)(card.childNodes[1].childNodes[3].childNodes[2].textContent);
            // let category = card.parentElement.parentElement.childNodes[1];

            let details = card.childNodes[3].childNodes;
            cost += price;

            $('.calculateItem').append(
                `<div class="selectedItem">
                    <ion-icon name="close-circle-outline" size="large" onclick="removeItem(this)"></ion-icon>
                    <img src="${card.childNodes[1].childNodes[1].src}">
                    <span class="itemCode">${details[3].textContent}</span>
                    <span>${details[1].textContent}</span>
                    <input type="number" min="1" class="itemNum" value="1">
                    <span class="itemPrice">${price}</span>
                </div>`)
            listenAndUpdate($('.selectedItem input').eq($('.selectedItem input').length-1)[0]);
            //  Cost is updated.
            updateCost();
        }     
 })
}

function listenAndUpdate(obj){
    // Are event listeners removed once the obj is?
    obj.addEventListener('change', e => {
        let index = $('.selectedItem input').index(e.currentTarget);
        updatePrice(index);
    })
}

function removeItem(obj){
        let index =  $('ion-icon').index(obj);
        cost -= (Number)($('.selectedItem').eq(index).children().eq(5).text());
        updateCost();
        $('.selectedItem').eq(index).remove(); 
        selectedItems.splice(index,1);
}; 

function updatePrice(index){

    let unitPrice = (Number)(selectedItems[index].childNodes[1].childNodes[3].childNodes[2].textContent); // Assess the card for unitPrice
    
    cost -= (Number)($('.itemPrice').eq(index).text());

    $('.itemPrice').eq(index).text(unitPrice * ($('.itemNum').eq(index).val()));  // Find unit price and multiply it by (updated) num.

    cost += (Number)($('.itemPrice').eq(index).text());

    //  Cost is updated.
    updateCost();
}

function updateCost(){
    $('.totalCost').remove();
    if(!cost) $('.cart').slideUp();
    else{
      $('.calculateItem').append(
      `<div class="totalCost">
                Total Cost: ${cost}
        </div>`  
        )
        if(discountDays.includes(new Date().getDay())){
            $('#discountprice').html(cost*discount);
            discountAmt = cost*discount;
        }
        calculateGrandTotal();
    }
}

function calculateGrandTotal(){
    $('#grand').html(cost - discountAmt + (Number)($('#delivery').val()));
}

function deliveryListener(){
    $('#delivery').change(()=>calculateGrandTotal());
}

function formListener(){
        $('form').submit(e=>{
            e.preventDefault();
            $('.orderdetail').html(
                `<p>Thank you,${$('#yourname').val()}!</p>
                <p>We will deliver to ${$('#address').val()}</p>
                <p> and contact you at ${$('#phone').val()}.</p>
                <p> The grand total is ${$('#grand').text()}.</p>
                <p> Have a great day! </p>
                `
            )
        })
}
