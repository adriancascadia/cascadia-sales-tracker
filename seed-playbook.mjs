import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL.split('@')[1].split('/')[0],
  user: process.env.DATABASE_URL.split('://')[1].split(':')[0],
  password: process.env.DATABASE_URL.split(':')[2].split('@')[0],
  database: process.env.DATABASE_URL.split('/').pop(),
});

const companyId = 1;

// Create playbook categories
const categories = [
  { name: 'Premium Beverages', description: 'Unique non-alcoholic beverages with compelling stories', icon: '🥤' },
  { name: 'Specialty Waters', description: 'Premium bottled waters from around the world', icon: '💧' },
  { name: 'Healthy Snacks', description: 'Gourmet snacks with health benefits', icon: '🍿' },
  { name: 'Objection Handling', description: 'Proven strategies for common sales objections', icon: '🎯' },
  { name: 'Cafe Selling Tactics', description: 'Specific strategies for upscale cafes', icon: '☕' },
  { name: 'New Product Launch', description: 'How to introduce new items and flavors', icon: '🚀' },
];

const categoryResults = [];
for (const cat of categories) {
  const [result] = await connection.execute(
    'INSERT INTO playbook_categories (companyId, name, description, icon, displayOrder) VALUES (?, ?, ?, ?, ?)',
    [companyId, cat.name, cat.description, cat.icon, categoryResults.length]
  );
  categoryResults.push(result.insertId);
}

// Create playbook entries
const entries = [
  // Premium Beverages
  {
    categoryId: categoryResults[0],
    title: 'Borjomi - Georgian Sparkling Mineral Water',
    entryType: 'product_strategy',
    description: 'Premium mineral water with unique volcanic origin',
    content: `**Product Story:**
Borjomi comes from the Republic of Georgia with a 5,000-year history. It's naturally carbonated with unique mineral composition from volcanic sources.

**Positioning for Cafes:**
- Premium alternative to standard sparkling water
- Unique origin story appeals to upscale cafe customers
- Perfect for health-conscious clientele
- Distinctive bottle design adds visual appeal to cafe shelves

**Key Talking Points:**
1. Naturally carbonated (no CO2 injection)
2. Rich mineral content (calcium, magnesium, potassium)
3. Unique taste profile that sets it apart
4. Premium positioning justifies higher price point

**Cafe Integration:**
- Feature as premium water option on menu
- Pair with pastries and light snacks
- Use in specialty cocktails (virgin mojitos, etc.)
- Highlight the Georgian heritage story

**Trial Strategy:**
"Let's start with a small case to test with your premium customers. The unique taste and story will differentiate your offering from competitors."`,
    tags: 'borjomi,water,premium,georgia,mineral'
  },
  {
    categoryId: categoryResults[0],
    title: 'Leelanu - Michigan Fruit RTD Iced Tea',
    entryType: 'product_strategy',
    description: 'Gourmet iced tea made with real Michigan fruits',
    content: `**Product Story:**
Leelanu is crafted with real Michigan fruits, not just natural flavors. This is a genuine differentiator in the RTD tea market.

**Positioning for Cafes:**
- Local/regional angle (Michigan pride)
- Real fruit vs. competitors using only flavors
- Premium quality justifies higher price
- Appeals to health-conscious customers

**Key Talking Points:**
1. Real Michigan fruits (not just flavoring)
2. No artificial ingredients
3. Supports local agriculture
4. Superior taste compared to mass-market brands

**Cafe Integration:**
- Position as "craft" alternative to mass-market iced tea
- Pair with pastries and light breakfast items
- Highlight the local/artisan angle
- Feature on menu as "Michigan-made"

**Trial Strategy:**
"Your customers who buy our pastries will love this - it's the perfect pairing. Let's do a 2-week trial and see how your customers respond to the real fruit quality."`,
    tags: 'leelanu,tea,michigan,fruit,real'
  },
  {
    categoryId: categoryResults[0],
    title: 'House of Cha - Gourmet RTD Cha with Oat Milk',
    entryType: 'product_strategy',
    description: 'Premium ready-to-drink beverage with oat milk',
    content: `**Product Story:**
House of Cha combines traditional chai spices with modern oat milk, creating a premium RTD beverage for health-conscious consumers.

**Positioning for Cafes:**
- Dairy-free alternative (appeals to vegan customers)
- Chai trend is growing in specialty cafes
- Ready-to-drink convenience
- Premium positioning

**Key Talking Points:**
1. Oat milk base (creamy, sustainable)
2. Traditional chai spices
3. No artificial ingredients
4. Perfect for customers wanting chai without the wait

**Cafe Integration:**
- Feature as grab-and-go chai option
- Pair with pastries and baked goods
- Position as alternative to coffee
- Highlight dairy-free/vegan angle

**Trial Strategy:**
"Your vegan and health-conscious customers are looking for options like this. Let's start with a small order to see how it performs."`,
    tags: 'house-of-cha,chai,oat-milk,premium,vegan'
  },
  // Specialty Waters
  {
    categoryId: categoryResults[1],
    title: 'Hawaiian Springs - Volcanic Mineral Water',
    entryType: 'product_strategy',
    description: 'Hawaii\'s original bottled water with 13,000 feet of volcanic minerals',
    content: `**Product Story:**
Hawaiian Springs is Hawaii's original bottled water. It comes from the ground naturally with minerals from 13,000 feet of volcanic lava. It's NEVER filtered tap water and NEVER tankered to a bottling facility like competitors.

**Positioning for Cafes:**
- Authentic Hawaiian origin (not imported from mainland)
- Volcanic mineral content (health benefits)
- Premium quality story
- Unique positioning vs. generic bottled water

**Key Talking Points:**
1. Natural source (not tap water)
2. Volcanic minerals (13,000 feet deep)
3. Never tankered (maintains quality)
4. Hawaii's original - authentic heritage

**Cafe Integration:**
- Premium water option on menu
- Highlight the Hawaiian story
- Pair with pastries and light meals
- Use in specialty beverages

**Objection Handling:**
"Yes, it's premium priced, but your customers are paying for authenticity and quality. This is Hawaii's original - not a generic import. The volcanic minerals and natural source justify the premium."

**Trial Strategy:**
"Let's start with a case to test with your premium customers. The story and quality will set you apart from competitors offering generic water."`,
    tags: 'hawaiian-springs,water,hawaii,volcanic,premium'
  },
  {
    categoryId: categoryResults[1],
    title: 'Yice - Premium Canadian Bottled Water',
    entryType: 'product_strategy',
    description: 'Imported premium bottled water from Canada',
    content: `**Product Story:**
Yice is premium bottled water imported from Canada. It represents the quality and purity of Canadian natural sources.

**Positioning for Cafes:**
- International premium positioning
- Canadian quality reputation
- Differentiator from standard water
- Appeals to customers seeking premium options

**Key Talking Points:**
1. Canadian source (quality reputation)
2. Premium positioning
3. International appeal
4. Unique alternative to local options

**Cafe Integration:**
- Feature as international water option
- Highlight Canadian heritage
- Position alongside other premium beverages
- Use in specialty drinks

**Trial Strategy:**
"Your international customers and premium clientele will appreciate this option. Let's test it to see how it performs."`,
    tags: 'yice,water,canada,premium,imported'
  },
  {
    categoryId: categoryResults[1],
    title: 'Akville - EU Baby-Safe Bottled Water',
    entryType: 'product_strategy',
    description: 'The only bottled water recommended for babies in the EU',
    content: `**Product Story:**
Akville is the only bottled water recommended for babies in the EU. It's non-sparkling water from Lithuania with exceptional purity standards.

**Positioning for Cafes:**
- Premium purity positioning
- Health-conscious angle
- EU safety certification
- Unique selling point (baby-safe)

**Key Talking Points:**
1. EU recommended for babies (highest purity standard)
2. Non-sparkling (smooth taste)
3. Lithuanian source
4. Exceptional mineral balance

**Cafe Integration:**
- Position as premium, pure water option
- Highlight health/purity angle
- Appeal to health-conscious customers
- Feature in premium beverage section

**Trial Strategy:**
"This is the most pure water available - recommended for babies in the EU. Your health-conscious customers will appreciate the quality and safety story."`,
    tags: 'akville,water,lithuania,pure,premium,baby-safe'
  },
  // Healthy Snacks
  {
    categoryId: categoryResults[2],
    title: 'Poshi - Gourmet Vegetable Snack',
    entryType: 'product_strategy',
    description: 'Resealable vegetable snacks, also used as salad toppers',
    content: `**Product Story:**
Poshi is a gourmet vegetable snack in resealable bags. It's versatile - customers can eat it as a snack OR use it as a topper for salads and side dishes. It's sold on many US airlines as a healthy option.

**Positioning for Cafes:**
- Healthy snack option
- Versatile (snack or topper)
- Airline-approved quality
- Unique positioning

**Key Talking Points:**
1. Real vegetables (not processed)
2. Resealable packaging (convenient)
3. Airline-approved (quality indicator)
4. Versatile use (snack or topper)

**Cafe Integration:**
- Sell as standalone snack
- Feature as salad topper option
- Position as healthy alternative to chips
- Highlight airline approval

**Trial Strategy:**
"This is unique - your customers can buy it as a snack or use it on their salads. Let's start with a small order to test both use cases."`,
    tags: 'poshi,snack,vegetable,healthy,airline'
  },
  {
    categoryId: categoryResults[2],
    title: 'Mooosh - One-Ingredient Chicory Fiber Snack',
    entryType: 'product_strategy',
    description: 'Light sweet snack with only one ingredient: chicory fiber',
    content: `**Product Story:**
Mooosh is a light sweet snack with ONLY ONE INGREDIENT - chicory fiber. 9 grams per serving. No added sugar. Very healthy and tasty.

**Positioning for Cafes:**
- Ultra-clean ingredient list (1 ingredient!)
- No added sugar (appeals to health-conscious)
- Light and satisfying
- Premium positioning

**Key Talking Points:**
1. One ingredient only (chicory fiber)
2. 9 grams of fiber per serving
3. No added sugar
4. Tastes good (not a compromise)

**Cafe Integration:**
- Position as "guilt-free" sweet option
- Pair with coffee/tea
- Appeal to health-conscious customers
- Highlight the clean ingredient story

**Objection Handling:**
"Yes, it's premium priced, but look at the ingredient list - just one ingredient. Your customers will pay for this level of quality and health benefit."

**Trial Strategy:**
"This is perfect for your health-conscious customers. The one-ingredient story is powerful. Let's do a trial and watch how customers respond."`,
    tags: 'mooosh,snack,chicory,fiber,no-sugar,healthy'
  },
  {
    categoryId: categoryResults[2],
    title: 'Prime Cuts - Soft Premium Beef Jerky',
    entryType: 'product_strategy',
    description: 'Gourmet soft beef jerky made from 100% US beef',
    content: `**Product Story:**
Prime Cuts is a soft, gourmet premium beef jerky made from 100% US beef. The soft texture differentiates it from traditional jerky.

**Positioning for Cafes:**
- Premium protein snack
- Soft texture (unique)
- 100% US beef (quality indicator)
- Gourmet positioning

**Key Talking Points:**
1. Soft texture (not tough like traditional jerky)
2. 100% US beef (quality source)
3. Premium taste profile
4. Protein-rich (appeals to fitness customers)

**Cafe Integration:**
- Position as premium protein snack
- Pair with beverages
- Appeal to fitness-conscious customers
- Feature in snack section

**Trial Strategy:**
"This is different from typical jerky - the soft texture is a game-changer. Let's start with a small order to test customer response."`,
    tags: 'prime-cuts,jerky,beef,soft,premium,protein'
  },
  // Objection Handling
  {
    categoryId: categoryResults[3],
    title: 'Handling "No Shelf Space" Objection',
    entryType: 'objection_handling',
    description: 'Strategies for when cafes say they don\'t have shelf space',
    content: `**The Objection:**
"We don't have shelf space for new products."

**Understanding the Real Issue:**
- Space is limited (legitimate concern)
- They're worried about inventory turnover
- They may not see the value yet
- They're protecting their current suppliers

**Winning Strategies:**

1. **The Replacement Strategy**
   "I understand space is tight. What if we replace one of your slower-moving items with ours? We can track sales for 2 weeks and if it doesn't outperform, we'll pull it."

2. **The Premium Positioning**
   "Your premium customers expect premium options. This product will actually increase your average transaction value. Let's start with just 3-4 units on the shelf."

3. **The Rotating Inventory**
   "What if we do a rotating trial? We'll stock it for 2 weeks, measure sales, and if it works, we find permanent space. If not, no hard feelings."

4. **The Eye-Level Strategy**
   "We don't need much space - just eye-level positioning next to your premium beverages. It'll actually complement your existing products."

5. **The Margin Story**
   "Look at the margin on this - it's higher than what you're currently selling. Even if it takes a small space, it's worth more profit per square foot."

**Real-World Example:**
"I hear this a lot, and here's what I've found - when we start with just 3-4 units of our premium water, customers actually ask for it. It becomes a conversation piece. How about we try that approach?"

**Follow-up:**
"Let's do this - I'll come back in 2 weeks and we'll look at the numbers together. If it's not working, I'll pull it myself."`,
    tags: 'objection,space,shelf,inventory,premium'
  },
  {
    categoryId: categoryResults[3],
    title: 'Handling "We Don\'t Know Your Brand" Objection',
    entryType: 'objection_handling',
    description: 'Strategies when cafes are unfamiliar with your brands',
    content: `**The Objection:**
"We don't know your brand. Our customers won't buy it."

**Understanding the Real Issue:**
- They're risk-averse (legitimate concern)
- They don't want inventory that won't sell
- They're protecting their reputation
- They need proof of quality/demand

**Winning Strategies:**

1. **The Trial Approach**
   "That's exactly why I'm here. Let's do a trial - I'll stock it, and if your customers don't buy it, I'll take it back. Zero risk to you."

2. **The Story Angle**
   "You're right - they don't know us yet. But they WILL love this once they try it. Look at the product - it tells the story. Borjomi has 5,000 years of history. Leelanu uses real Michigan fruit. These stories sell themselves."

3. **The Social Proof**
   "We're already in [similar cafes in the area]. Your customers shop at those places too. Once they see it here, they'll recognize it."

4. **The Sampling Strategy**
   "Let me leave samples. Your team tries it first. Once you taste the quality, you'll understand why customers will buy it."

5. **The Premium Positioning**
   "Your customers come to you for premium products. This IS premium. The unknown brand actually becomes an advantage - it's exclusive to your cafe."

**Real-World Example:**
"I get this concern. But think about it - your customers discovered your cafe because they didn't know you either. They trusted your taste. Same thing here. Let's do a 2-week trial."

**Follow-up:**
"I'll personally check in after one week to see how it's going. I'm confident your customers will respond to the quality."`,
    tags: 'objection,brand,unknown,trial,premium'
  },
  {
    categoryId: categoryResults[3],
    title: 'Handling "You\'re Too Expensive" Objection',
    entryType: 'objection_handling',
    description: 'Strategies for premium pricing objections',
    content: `**The Objection:**
"Your prices are too high. We can get similar products cheaper elsewhere."

**Understanding the Real Issue:**
- They don't see the value yet
- They're comparing on price alone
- They don't understand the differentiation
- They're protecting margins

**Winning Strategies:**

1. **The Value Shift**
   "You're right - if we're the same, we shouldn't be more expensive. But we're not the same. Look at the difference - real Michigan fruit vs. natural flavoring. Volcanic minerals vs. tap water. One ingredient vs. 10. That's why the price is different."

2. **The Margin Story**
   "Yes, our cost is higher, but your margin is also higher. You'll make more profit per unit. Plus, premium customers expect premium pricing - it actually builds trust."

3. **The Differentiation Angle**
   "Your customers come to you for premium products. If you offer the same mass-market items as everyone else, you're competing on price. Our products let you compete on quality and story."

4. **The Customer Willingness**
   "Your premium customers will pay for this. They're already paying premium prices for your coffee and pastries. This is the same positioning. Test it - you'll see."

5. **The Total Cost Story**
   "Don't look at unit price - look at total cost. Our premium water has a better margin. Our snacks have higher perceived value. The math works in your favor."

**Real-World Example:**
"I hear this, and here's what I've learned - premium cafes don't compete on price. You compete on experience and quality. This product fits that positioning perfectly. Your customers will pay for it."

**Follow-up:**
"Let's look at the numbers after 2 weeks. I bet you'll see that the margin and customer response justify the premium price."`,
    tags: 'objection,price,expensive,premium,margin,value'
  },
  // Cafe Selling Tactics
  {
    categoryId: categoryResults[4],
    title: 'Beverage Pairing Strategy for Upscale Cafes',
    entryType: 'cafe_tactic',
    description: 'How to position beverages as complements to cafe offerings',
    content: `**The Strategy:**
Position premium beverages as part of the total cafe experience, not just standalone products.

**Pairing Recommendations:**

1. **With Premium Coffee**
   - Borjomi or Hawaiian Springs as a palate cleanser
   - Leelanu iced tea as a lighter alternative
   - Position as "coffee + water" combo

2. **With Pastries**
   - House of Cha pairs with sweet pastries
   - Mooosh snack pairs with coffee
   - Leelanu pairs with fruit-based pastries

3. **With Healthy Offerings**
   - Akville (pure water) with salads
   - Poshi as salad topper
   - Prime Cuts with healthy bowls

**Menu Integration:**
- Create "Premium Beverage" section
- Use pairing language ("Pairs well with...")
- Highlight the story on menu boards
- Train staff on talking points

**Upselling Technique:**
"With that pastry, can I suggest our Leelanu iced tea? It's made with real Michigan fruit - perfect pairing."

**Point-of-Sale Positioning:**
- Eye-level placement
- Attractive signage
- Sample cups available
- Staff incentives for suggestive selling

**Expected Results:**
- Higher average transaction value
- Increased customer satisfaction
- Differentiation from competitors
- Premium positioning reinforcement`,
    tags: 'cafe,pairing,beverage,upsell,premium'
  },
  {
    categoryId: categoryResults[4],
    title: 'Snack Integration into Cafe Menu',
    entryType: 'cafe_tactic',
    description: 'Strategies for positioning snacks within cafe offerings',
    content: `**The Strategy:**
Position snacks as complementary items that enhance the cafe experience and increase transaction value.

**Integration Points:**

1. **Grab-and-Go Section**
   - Mooosh for quick sweet snack
   - Prime Cuts for protein option
   - Poshi for healthy option

2. **With Beverages**
   - Mooosh with coffee/tea
   - Prime Cuts with water/tea
   - Poshi with healthy beverages

3. **As Salad Toppers**
   - Poshi as premium salad topper
   - Position on menu as "Salad Enhancements"
   - Train staff to suggest

4. **Health-Conscious Positioning**
   - Feature Mooosh (no sugar)
   - Feature Poshi (vegetable)
   - Create "Healthy Snacks" section

**Menu Presentation:**
- Separate "Premium Snacks" section
- Highlight key benefits (no sugar, one ingredient, etc.)
- Use descriptive language
- Include price point

**Staff Training:**
- Teach the story of each product
- Practice suggestive selling
- Explain health benefits
- Create talking points

**Pricing Strategy:**
- Position as premium (higher margin)
- Bundle with beverages for value
- Create combo pricing

**Expected Results:**
- Increased snack sales
- Higher average transaction
- Customer satisfaction
- Repeat purchases`,
    tags: 'cafe,snack,menu,integration,upsell'
  },
  {
    categoryId: categoryResults[4],
    title: 'Premium Positioning Strategy for Upscale Cafes',
    entryType: 'cafe_tactic',
    description: 'How to position your products as premium offerings',
    content: `**The Strategy:**
Reinforce premium positioning through every touchpoint in the cafe.

**Key Elements:**

1. **Visual Presentation**
   - Eye-level placement
   - Attractive shelving
   - Branded signage
   - Professional displays

2. **Story Telling**
   - Menu descriptions with origin stories
   - Staff trained on product stories
   - Signage highlighting unique features
   - Social media content

3. **Pricing Strategy**
   - Premium pricing justified by quality
   - Margin-focused approach
   - Bundle offerings
   - Combo deals

4. **Customer Experience**
   - Sampling opportunities
   - Staff recommendations
   - Educational signage
   - Consistent messaging

5. **Differentiation**
   - Unique products not found elsewhere
   - Exclusive positioning
   - Limited availability angle
   - Premium brand association

**Implementation Timeline:**
- Week 1: Product placement and signage
- Week 2: Staff training and sampling
- Week 3: Menu integration
- Week 4: Monitor and optimize

**Measurement:**
- Sales velocity
- Customer feedback
- Repeat purchase rate
- Average transaction value

**Success Indicators:**
- Customers asking for products by name
- Positive staff feedback
- Increasing sales week-over-week
- Customer comments on quality/story`,
    tags: 'cafe,premium,positioning,brand,experience'
  },
  // New Product Launch
  {
    categoryId: categoryResults[5],
    title: 'New Product Launch Strategy',
    entryType: 'launch_strategy',
    description: 'How to introduce new items and flavors to existing cafe partners',
    content: `**The Strategy:**
Create excitement and trial for new products while minimizing risk for cafe partners.

**Pre-Launch Phase:**
1. Build anticipation
   - Tease new products
   - Share the story/origin
   - Highlight unique features
   - Create exclusivity angle

2. Prepare cafe partners
   - Advance notice
   - Product samples
   - Staff training
   - Marketing materials

3. Create demand
   - Social media buzz
   - Email campaigns
   - In-store signage
   - Staff talking points

**Launch Phase:**

1. **Limited Availability Angle**
   "This is a new flavor we're launching. We're only bringing it to select cafes first - you're one of the first to get it."

2. **Sampling Strategy**
   - Provide samples to cafe staff
   - Provide samples for customers
   - Create trial opportunities
   - Gather feedback

3. **Exclusive Positioning**
   "Your customers will have access to this before it's widely available. It's an exclusive opportunity."

4. **Introductory Pricing**
   - Launch pricing (slightly lower)
   - Increase after initial period
   - Create urgency
   - Drive trial

**Post-Launch Phase:**

1. Monitor performance
   - Track sales
   - Gather customer feedback
   - Identify issues
   - Optimize placement

2. Gather testimonials
   - Customer feedback
   - Staff feedback
   - Sales data
   - Success stories

3. Scale if successful
   - Expand to more cafes
   - Increase order volume
   - Build momentum
   - Create FOMO

**Real-World Example:**
"We just launched this new flavor of Borjomi - it's only available in a few premium cafes right now. Your customers will love being first to try it. Let's do a 2-week trial and see how it performs."

**Success Metrics:**
- Trial rate
- Repeat purchase rate
- Customer feedback
- Sales velocity`,
    tags: 'launch,new,product,flavor,exclusive,trial'
  }
];

for (const entry of entries) {
  await connection.execute(
    'INSERT INTO playbook_entries (companyId, categoryId, title, description, content, entryType, tags, displayOrder, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [companyId, entry.categoryId, entry.title, entry.description, entry.content, entry.entryType, entry.tags, entries.indexOf(entry), true]
  );
}

console.log('✅ Playbook seeded successfully!');
await connection.end();
