import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Brain, Send, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface CoachingResponse {
  advice: string;
  strategies: string[];
  examples: string[];
  resources?: string[];
}

export default function AISalesCoach() {
  const [activeTab, setActiveTab] = useState("objection");
  const [objection, setObjection] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [industry, setIndustry] = useState("");
  const [repExperience, setRepExperience] = useState<"junior" | "mid" | "senior">("mid");
  const [response, setResponse] = useState<CoachingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleObjectionMutation = trpc.aiCoach.handleObjection.useMutation();
  const customerStrategyQuery = trpc.aiCoach.getCustomerStrategy.useQuery(
    { customerName, industry },
    { enabled: false }
  );

  const handleGetObjectionAdvice = async () => {
    if (!objection.trim()) {
      toast.error("Please enter an objection");
      return;
    }

    setIsLoading(true);
    try {
      const result = await handleObjectionMutation.mutateAsync({
        objection,
        customerName: customerName || undefined,
        industry: industry || undefined,
        repExperience,
      });
      setResponse(result);
      toast.success("Coaching advice generated!");
    } catch (error) {
      toast.error("Failed to get coaching advice");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCustomerStrategy = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }

    setIsLoading(true);
    try {
      const result = await customerStrategyQuery.refetch();
      if (result.data) {
        setResponse(result.data);
        toast.success("Customer strategy generated!");
      }
    } catch (error) {
      toast.error("Failed to get customer strategy");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">AI Sales Coach</h1>
          <p className="text-muted-foreground">Expert coaching for food & beverage retail sales</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Ask for Coaching</CardTitle>
            <CardDescription>Get personalized advice instantly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="objection">Objections</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
              </TabsList>

              <TabsContent value="objection" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">What objection are you facing?</label>
                  <Textarea
                    placeholder="e.g., 'Restaurant owner says they already have a supplier' or 'Deli owner concerned about minimum order quantity'"
                    value={objection}
                    onChange={(e) => setObjection(e.target.value)}
                    className="mt-2 min-h-24"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Store Name (optional)</label>
                  <Input
                    placeholder="e.g., Mario's Italian Deli, The Daily Cafe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Store Type (optional)</label>
                  <Input
                    placeholder="e.g., Restaurant, Bakery, Deli, Cafe, Grocery Store"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Your Experience Level</label>
                  <div className="mt-2 flex gap-2">
                    {(["junior", "mid", "senior"] as const).map((level) => (
                      <Button
                        key={level}
                        variant={repExperience === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRepExperience(level)}
                        className="flex-1 capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGetObjectionAdvice}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Advice...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Get Coaching Advice
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Store Name</label>
                  <Input
                    placeholder="e.g., Mario's Italian Deli, The Daily Cafe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Store Type (optional)</label>
                  <Input
                    placeholder="e.g., Restaurant, Bakery, Deli, Cafe, Grocery Store"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleGetCustomerStrategy}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Strategy...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Get Customer Strategy
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Response Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Coaching Advice</CardTitle>
            <CardDescription>AI-powered recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-6">
                {/* Main Advice */}
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Key Advice</h3>
                      <p className="text-blue-800 mt-1">{response.advice}</p>
                    </div>
                  </div>
                </div>

                {/* Strategies */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Strategies to Use
                  </h3>
                  <div className="space-y-2">
                    {response.strategies.map((strategy, idx) => (
                      <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted">
                        <Badge variant="outline" className="flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </Badge>
                        <p className="text-sm">{strategy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Real-World Examples
                  </h3>
                  <div className="space-y-2">
                    {response.examples.map((example, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-muted-foreground/20">
                        <p className="text-sm italic text-muted-foreground">"{example}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                {response.resources && response.resources.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Additional Resources</h3>
                    <ul className="space-y-2">
                      {response.resources.map((resource, idx) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <span className="text-blue-600">•</span>
                          <span>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Ask a question to get personalized coaching advice
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Be specific about the objection or challenge you're facing</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Include store context (name, type) for more tailored advice</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Select your experience level for advice matched to your skill</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Remember: Small store owners value quick decisions and reliability over contracts</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Use the strategies immediately in your next customer interaction</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
