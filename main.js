var eventBus = new Vue();

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `    
        <ul>            
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
    `
});

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            
            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>
            <p>
                <label for="name">Name: </label>
                <input id="name" v-model="name"> 
            </p>

            <p>
                <label for="review">Review: </label>
                <textarea id="review" v-model="review"></textarea>
            </p>

            <p>
                <p>Would you recommend this product?</p>
                <label for="yes">YES</label>
                <input type="radio" value="YES" v-model="recommend">
                <label for="no">NO</label> 
                <input type="radio" value="NO" v-model="recommend"> 
            </p>

            <p>
                <label for="rating">Rating: </label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>

            <p>
                <input type="submit" value="Submit">
            </p>
        </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommend = this.recommend;
            }
            else {
                if(!this.name) this.errors.push("Name Required");
                if(!this.review) this.errors.push("Review Required");
                if(!this.rating) this.errors.push("Rating Required");
                if(!this.recommend) this.errors.push("Recommendation Required");
            }
        }
    }
});

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <span class="tab"
                :class="{ activeTab: selectedTab === tab}"
                v-for="(tab, index) in tabs" 
                :key="index"
                @click="selectedTab=tab"
                >{{ tab }}</span>

            <div v-show="selectedTab == 'Reviews'">
                <h2>Reviews</h2>
                <p v-if="!reviews.length"> There are no reviews yet.</p>

                <ul>
                    <li v-for="(review,index) in reviews" :key="index">
                        <p>{{ review.name }} - {{ review.review }}  </p>
                        <p>Rating: {{ review.rating }} </p> 
                        <p>Recommended: {{ review.recommend }} </p>
                    </li>
                </ul>
            </div>

            <product-review v-show="selectedTab == 'Post a Review'"></product-review>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Post a Review'],
            selectedTab: 'Reviews'
        }
    }
});

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image">
            </div>

            <div class="product-info">
                <h1>{{ title }}</h1>
                <p v-if="inStock">In Stock</p>
                <p v-else
                    :class="{ outOfStock: !inStock }">Out of Stock</p>
                <!-- <p v-if="inventory > 10">In Stock</p>
                <p v-else-if="inventory <= 10 && inventory > 0">Almost Stock Out</p>
                <p v-else>Out of Stock</p> -->
                <p>Shipping: {{ shipping }}</p>
                <!-- <p v-show="onSale">On Sale</p> -->
                <p>{{ sale }}</p>
                
                <product-details :details="details"></product-details>

                <p><u>Available Sizes: </u></p>
                <ul>
                    <li v-for="size in sizes">{{ size }}</li>
                </ul>
                <p>Price: {{ price }}</p>

                <div class="color-box" 
                    v-for="(variant, index) in variants" 
                    :key="variant.variantId"
                    :style="{ backgroundColor: variant.variantColor }"
                    @mouseover="updateProduct(index)">
                </div>

                <button @click="addToCart" 
                        :disabled="!inStock"
                        :class="{ disabledButton: !inStock }">Add To Cart</button>
                
                <br>
                <button @click="removeFromCart">Remove From Cart</button>
                <br>
                <a :href="url" target="_blank">More Products Like this</a>
            </div>

            <product-tabs :reviews="reviews"></product-tabs>
             
        </div>
    `,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            price: '2.99$',
            selectedVariant: 0,
            // inStock: true,
            // inventory: 15,
            onSale: true,
            details: ['80% cotton', '20% polyster', 'Gender-neutral'],
            sizes: ['S', 'M', 'L'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: "green",
                    variantImage: './assets/vmSocks-green.jpg',
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: "blue",
                    variantImage: './assets/vmSocks-blue.jpg',
                    variantQuantity: 5
                }
            ],
            url: 'https://www.daraz.com.bd/mens-socks/',
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        sale() {
            if(this.onSale) {
                return this.brand + ' ' + this.product + ' are on sale!';
            }
            return this.brand + ' ' + this.product + ' are not on sale!';
        },
        shipping() {
            return this.premium ? 'Free' : '5.99$';
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        });
    }
});

var app = new Vue({
    el: '#app', 
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeItem(id) {    
            for(let i = this.cart.length -1; i >= 0; i--) {
                if(this.cart[i] == id) {
                    this.cart.splice(i, 1);
                }
            }
        }
    }
});