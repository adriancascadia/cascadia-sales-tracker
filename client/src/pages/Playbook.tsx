import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Bookmark, Star } from "lucide-react";
import { Streamdown } from "streamdown";

interface PlaybookEntry {
  id: string;
  category: string;
  icon: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
}

const playbookData: PlaybookEntry[] = [
  {
    id: "borjomi",
    category: "Premium Beverages",
    icon: "🥤",
    title: "Borjomi - Georgian Sparkling Mineral Water",
    description: "Premium mineral water with unique volcanic origin",
    tags: ["borjomi", "water", "premium", "georgia"],
    content: `## Borjomi - Georgian Sparkling Mineral Water

### Product Story
Borjomi comes from the Republic of Georgia with a 5,000-year history. It's naturally carbonated with unique mineral composition from volcanic sources.

### Positioning for Cafes
- Premium alternative to standard sparkling water
- Unique origin story appeals to upscale cafe customers
- Perfect for health-conscious clientele
- Distinctive bottle design adds visual appeal to cafe shelves

### Key Talking Points
1. **Naturally carbonated** (no CO2 injection)
2. **Rich mineral content** (calcium, magnesium, potassium)
3. **Unique taste profile** that sets it apart
4. **Premium positioning** justifies higher price point

### Cafe Integration
- Feature as premium water option on menu
- Pair with pastries and light snacks
- Use in specialty cocktails (virgin mojitos, etc.)
- Highlight the Georgian heritage story

### Trial Strategy
"Let's start with a small case to test with your premium customers. The unique taste and story will differentiate your offering from competitors."`,
  },
  {
    id: "leelanu",
    category: "Premium Beverages",
    icon: "🥤",
    title: "Leelanu - Michigan Fruit RTD Iced Tea",
    description: "Gourmet iced tea made with real Michigan fruits",
    tags: ["leelanu", "tea", "michigan", "fruit"],
    content: `## Leelanu - Michigan Fruit RTD Iced Tea

### Product Story
Leelanu is crafted with real Michigan fruits, not just natural flavors. This is a genuine differentiator in the RTD tea market.

### Positioning for Cafes
- Local/regional angle (Michigan pride)
- Real fruit vs. competitors using only flavors
- Premium quality justifies higher price
- Appeals to health-conscious customers

### Key Talking Points
1. **Real Michigan fruits** (not just flavoring)
2. **No artificial ingredients**
3. **Supports local agriculture**
4. **Superior taste** compared to mass-market brands

### Cafe Integration
- Position as "craft" alternative to mass-market iced tea
- Pair with pastries and light breakfast items
- Highlight the local/artisan angle
- Feature on menu as "Michigan-made"

### Trial Strategy
"Your customers who buy our pastries will love this - it's the perfect pairing. Let's do a 2-week trial and see how your customers respond to the real fruit quality."`,
  },
  {
    id: "hawaiian-springs",
    category: "Specialty Waters",
    icon: "💧",
    title: "Hawaiian Springs - Volcanic Mineral Water",
    description: "Hawaii's original bottled water with 13,000 feet of volcanic minerals",
    tags: ["hawaiian-springs", "water", "hawaii", "volcanic"],
    content: `## Hawaiian Springs - Volcanic Mineral Water

### Product Story
Hawaiian Springs is Hawaii's original bottled water. It comes from the ground naturally with minerals from 13,000 feet of volcanic lava. It's NEVER filtered tap water and NEVER tankered to a bottling facility like competitors.

### Positioning for Cafes
- Authentic Hawaiian origin (not imported from mainland)
- Volcanic mineral content (health benefits)
- Premium quality story
- Unique positioning vs. generic bottled water

### Key Talking Points
1. **Natural source** (not tap water)
2. **Volcanic minerals** (13,000 feet deep)
3. **Never tankered** (maintains quality)
4. **Hawaii's original** - authentic heritage

### Cafe Integration
- Premium water option on menu
- Highlight the Hawaiian story
- Pair with pastries and light meals
- Use in specialty beverages

### Objection Handling
"Yes, it's premium priced, but your customers are paying for authenticity and quality. This is Hawaii's original - not a generic import. The volcanic minerals and natural source justify the premium."

### Trial Strategy
"Let's start with a case to test with your premium customers. The story and quality will set you apart from competitors offering generic water."`,
  },
  {
    id: "mooosh",
    category: "Healthy Snacks",
    icon: "🍿",
    title: "Mooosh - One-Ingredient Chicory Fiber Snack",
    description: "Light sweet snack with only one ingredient: chicory fiber",
    tags: ["mooosh", "snack", "chicory", "no-sugar"],
    content: `## Mooosh - One-Ingredient Chicory Fiber Snack

### Product Story
Mooosh is a light sweet snack with ONLY ONE INGREDIENT - chicory fiber. 9 grams per serving. No added sugar. Very healthy and tasty.

### Positioning for Cafes
- Ultra-clean ingredient list (1 ingredient!)
- No added sugar (appeals to health-conscious)
- Light and satisfying
- Premium positioning

### Key Talking Points
1. **One ingredient only** (chicory fiber)
2. **9 grams of fiber** per serving
3. **No added sugar**
4. **Tastes good** (not a compromise)

### Cafe Integration
- Position as "guilt-free" sweet option
- Pair with coffee/tea
- Appeal to health-conscious customers
- Highlight the clean ingredient story

### Objection Handling
"Yes, it's premium priced, but look at the ingredient list - just one ingredient. Your customers will pay for this level of quality and health benefit."

### Trial Strategy
"This is perfect for your health-conscious customers. The one-ingredient story is powerful. Let's do a trial and watch how customers respond."`,
  },
  {
    id: "objection-space",
    category: "Objection Handling",
    icon: "🎯",
    title: "Handling 'No Shelf Space' Objection",
    description: "Strategies for when cafes say they don't have shelf space",
    tags: ["objection", "space", "shelf", "premium"],
    content: `## Handling "No Shelf Space" Objection

### The Objection
"We don't have shelf space for new products."

### Understanding the Real Issue
- Space is limited (legitimate concern)
- They're worried about inventory turnover
- They may not see the value yet
- They're protecting their current suppliers

### Winning Strategies

#### 1. The Replacement Strategy
"I understand space is tight. What if we replace one of your slower-moving items with ours? We can track sales for 2 weeks and if it doesn't outperform, we'll pull it."

#### 2. The Premium Positioning
"Your premium customers expect premium options. This product will actually increase your average transaction value. Let's start with just 3-4 units on the shelf."

#### 3. The Rotating Inventory
"What if we do a rotating trial? We'll stock it for 2 weeks, measure sales, and if it works, we find permanent space. If not, no hard feelings."

#### 4. The Eye-Level Strategy
"We don't need much space - just eye-level positioning next to your premium beverages. It'll actually complement your existing products."

#### 5. The Margin Story
"Look at the margin on this - it's higher than what you're currently selling. Even if it takes a small space, it's worth more profit per square foot."

### Real-World Example
"I hear this a lot, and here's what I've found - when we start with just 3-4 units of our premium water, customers actually ask for it. It becomes a conversation piece. How about we try that approach?"

### Follow-up
"Let's do this - I'll come back in 2 weeks and we'll look at the numbers together. If it's not working, I'll pull it myself."`,
  },
  {
    id: "objection-price",
    category: "Objection Handling",
    icon: "🎯",
    title: "Handling 'You're Too Expensive' Objection",
    description: "Strategies for premium pricing objections",
    tags: ["objection", "price", "expensive", "premium"],
    content: `## Handling "You're Too Expensive" Objection

### The Objection
"Your prices are too high. We can get similar products cheaper elsewhere."

### Understanding the Real Issue
- They don't see the value yet
- They're comparing on price alone
- They don't understand the differentiation
- They're protecting margins

### Winning Strategies

#### 1. The Value Shift
"You're right - if we're the same, we shouldn't be more expensive. But we're not the same. Look at the difference - real Michigan fruit vs. natural flavoring. Volcanic minerals vs. tap water. One ingredient vs. 10. That's why the price is different."

#### 2. The Margin Story
"Yes, our cost is higher, but your margin is also higher. You'll make more profit per unit. Plus, premium customers expect premium pricing - it actually builds trust."

#### 3. The Differentiation Angle
"Your customers come to you for premium products. If you offer the same mass-market items as everyone else, you're competing on price. Our products let you compete on quality and story."

#### 4. The Customer Willingness
"Your premium customers will pay for this. They're already paying premium prices for your coffee and pastries. This is the same positioning. Test it - you'll see."

#### 5. The Total Cost Story
"Don't look at unit price - look at total cost. Our premium water has a better margin. Our snacks have higher perceived value. The math works in your favor."

### Real-World Example
"I hear this, and here's what I've learned - premium cafes don't compete on price. You compete on experience and quality. This product fits that positioning perfectly. Your customers will pay for it."

### Follow-up
"Let's look at the numbers after 2 weeks. I bet you'll see that the margin and customer response justify the premium price."`,
  },
  {
    id: "cafe-pairing",
    category: "Cafe Selling Tactics",
    icon: "☕",
    title: "Beverage Pairing Strategy for Upscale Cafes",
    description: "How to position beverages as complements to cafe offerings",
    tags: ["cafe", "pairing", "beverage", "upsell"],
    content: `## Beverage Pairing Strategy for Upscale Cafes

### The Strategy
Position premium beverages as part of the total cafe experience, not just standalone products.

### Pairing Recommendations

#### With Premium Coffee
- Borjomi or Hawaiian Springs as a palate cleanser
- Leelanu iced tea as a lighter alternative
- Position as "coffee + water" combo

#### With Pastries
- House of Cha pairs with sweet pastries
- Mooosh snack pairs with coffee
- Leelanu pairs with fruit-based pastries

#### With Healthy Offerings
- Akville (pure water) with salads
- Poshi as salad topper
- Prime Cuts with healthy bowls

### Menu Integration
- Create "Premium Beverage" section
- Use pairing language ("Pairs well with...")
- Highlight the story on menu boards
- Train staff on talking points

### Upselling Technique
"With that pastry, can I suggest our Leelanu iced tea? It's made with real Michigan fruit - perfect pairing."

### Point-of-Sale Positioning
- Eye-level placement
- Attractive signage
- Sample cups available
- Staff incentives for suggestive selling

### Expected Results
- Higher average transaction value
- Increased customer satisfaction
- Differentiation from competitors
- Premium positioning reinforcement`,
  },
  {
    id: "new-product-launch",
    category: "New Product Launch",
    icon: "🚀",
    title: "New Product Launch Strategy",
    description: "How to introduce new items and flavors to existing cafe partners",
    tags: ["launch", "new", "product", "exclusive"],
    content: `## New Product Launch Strategy

### The Strategy
Create excitement and trial for new products while minimizing risk for cafe partners.

### Pre-Launch Phase

#### 1. Build Anticipation
- Tease new products
- Share the story/origin
- Highlight unique features
- Create exclusivity angle

#### 2. Prepare Cafe Partners
- Advance notice
- Product samples
- Staff training
- Marketing materials

#### 3. Create Demand
- Social media buzz
- Email campaigns
- In-store signage
- Staff talking points

### Launch Phase

#### 1. Limited Availability Angle
"This is a new flavor we're launching. We're only bringing it to select cafes first - you're one of the first to get it."

#### 2. Sampling Strategy
- Provide samples to cafe staff
- Provide samples for customers
- Create trial opportunities
- Gather feedback

#### 3. Exclusive Positioning
"Your customers will have access to this before it's widely available. It's an exclusive opportunity."

#### 4. Introductory Pricing
- Launch pricing (slightly lower)
- Increase after initial period
- Create urgency
- Drive trial

### Post-Launch Phase

#### 1. Monitor Performance
- Track sales
- Gather customer feedback
- Identify issues
- Optimize placement

#### 2. Gather Testimonials
- Customer feedback
- Staff feedback
- Sales data
- Success stories

#### 3. Scale If Successful
- Expand to more cafes
- Increase order volume
- Build momentum
- Create FOMO

### Real-World Example
"We just launched this new flavor of Borjomi - it's only available in a few premium cafes right now. Your customers will love being first to try it. Let's do a 2-week trial and see how it performs."

### Success Metrics
- Trial rate
- Repeat purchase rate
- Customer feedback
- Sales velocity`,
  },
];

const categories = ["Premium Beverages", "Specialty Waters", "Healthy Snacks", "Objection Handling", "Cafe Selling Tactics", "New Product Launch"];

export default function Playbook() {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const filteredEntries = selectedCategory
    ? playbookData.filter((e) => e.category === selectedCategory)
    : playbookData;

  const currentEntry = selectedEntry ? playbookData.find((e) => e.id === selectedEntry) : null;

  const toggleBookmark = (id: string) => {
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
    } else {
      newBookmarks.add(id);
    }
    setBookmarks(newBookmarks);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sales Playbook</h1>
          <p className="text-lg text-slate-600">
            Expert strategies for selling gourmet products to upscale cafes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  📚 All Strategies
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {playbookData.find((e) => e.category === cat)?.icon} {cat}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentEntry ? (
              // Entry Detail View
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEntry(null)}
                        className="mb-2"
                      >
                        ← Back to List
                      </Button>
                      <CardTitle className="text-2xl">{currentEntry.title}</CardTitle>
                      <CardDescription className="mt-2">{currentEntry.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBookmark(currentEntry.id)}
                    >
                      {bookmarks.has(currentEntry.id) ? (
                        <Bookmark className="h-5 w-5 fill-current text-amber-500" />
                      ) : (
                        <Star className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <Streamdown>{currentEntry.content}</Streamdown>
                  </div>
                  {currentEntry.tags && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm font-semibold text-slate-600 mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentEntry.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              // Entries List View
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedEntry(entry.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                          <CardDescription className="mt-1">{entry.description}</CardDescription>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 ml-2" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{entry.category}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(entry.id);
                          }}
                        >
                          {bookmarks.has(entry.id) ? (
                            <Bookmark className="h-4 w-4 fill-current text-amber-500" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
