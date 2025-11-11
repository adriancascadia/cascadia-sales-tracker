import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  generateRouteSuggestions,
  getRecommendation,
  RoutePrediction,
} from "@/lib/predictiveRoutesService";
import { Lightbulb, Zap, MapPin, Clock, DollarSign, CheckCircle } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  visitFrequency?: number;
  averageOrderValue?: number;
  lastVisitDate?: Date;
  preferredVisitTime?: string;
}

interface PredictiveRouteSuggestionsProps {
  customers: Customer[];
  startPoint?: { lat: number; lng: number };
  onSelectRoute?: (route: RoutePrediction) => void;
}

export default function PredictiveRouteSuggestions({
  customers,
  startPoint = { lat: 0, lng: 0 },
  onSelectRoute,
}: PredictiveRouteSuggestionsProps) {
  const suggestions = generateRouteSuggestions(customers, startPoint, 3);
  const recommendation = getRecommendation(suggestions);

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Route Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No customers available for route suggestions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recommendation Alert */}
      {recommendation && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">Recommended Route</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on distance optimization and revenue potential
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {recommendation.confidence}% confidence
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Route Suggestions */}
      <div className="grid gap-4">
        {suggestions.map((suggestion, idx) => (
          <Card key={idx} className={recommendation === suggestion ? "border-green-500" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Option {idx + 1}
                    {recommendation === suggestion && (
                      <Badge className="bg-green-100 text-green-800 ml-2">Recommended</Badge>
                    )}
                  </CardTitle>
                </div>
                <Badge variant="outline">{suggestion.confidence}% confidence</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="font-semibold">{suggestion.estimatedDistance.toFixed(1)} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold">
                      {Math.round(suggestion.estimatedDuration / 60)}h{" "}
                      {suggestion.estimatedDuration % 60}m
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-semibold">${suggestion.estimatedRevenue.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              {/* Route Sequence */}
              <div>
                <p className="text-sm font-medium mb-2">Route Sequence ({suggestion.sequence.length} stops)</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {suggestion.sequence.map((customer, stopIdx) => (
                    <div key={customer.id} className="flex items-center gap-2 text-sm">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {stopIdx + 1}
                      </span>
                      <span className="flex-1">{customer.name}</span>
                      {customer.averageOrderValue && (
                        <span className="text-xs text-muted-foreground">
                          ${customer.averageOrderValue}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <p className="text-sm font-medium mb-2">Why this route?</p>
                <ul className="space-y-1">
                  {suggestion.reasoning.map((reason, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button
                className="w-full"
                variant={recommendation === suggestion ? "default" : "outline"}
                onClick={() => onSelectRoute?.(suggestion)}
              >
                Use This Route
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            Tips for Better Routes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1 text-muted-foreground">
          <p>• Update customer visit frequencies to improve suggestions</p>
          <p>• Set preferred visit times for better scheduling</p>
          <p>• The more historical data, the more accurate predictions become</p>
        </CardContent>
      </Card>
    </div>
  );
}
