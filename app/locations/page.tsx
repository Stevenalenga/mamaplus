'use client'

import { useState } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, List, MapIcon, Phone, Mail, Clock } from 'lucide-react'

// School location data
const schools = [
  {
    id: 1,
    name: 'MamaPlus Downtown School',
    address: '123 Main Street, Nairobi',
    phone: '+254 700 000 001',
    email: 'downtown@mamaplus.co.ke',
    hours: 'Mon-Fri: 7:00 AM - 5:00 PM',
    position: { lat: -1.2864, lng: 36.8172 },
    description: 'Our flagship school in the heart of Nairobi, offering comprehensive early childhood education.'
  },
  {
    id: 2,
    name: 'MamaPlus Westlands Branch',
    address: '456 Waiyaki Way, Westlands',
    phone: '+254 700 000 002',
    email: 'westlands@mamaplus.co.ke',
    hours: 'Mon-Fri: 7:00 AM - 5:00 PM',
    position: { lat: -1.2676, lng: 36.8079 },
    description: 'Modern facilities with a focus on holistic child development and parent education.'
  },
  {
    id: 3,
    name: 'MamaPlus Karen Center',
    address: '789 Karen Road, Karen',
    phone: '+254 700 000 003',
    email: 'karen@mamaplus.co.ke',
    hours: 'Mon-Fri: 7:00 AM - 5:00 PM',
    position: { lat: -1.3219, lng: 36.7073 },
    description: 'Spacious campus with outdoor learning areas and dedicated parent support services.'
  },
  {
    id: 4,
    name: 'MamaPlus Kilimani School',
    address: '321 Elgeyo Marakwet Road, Kilimani',
    phone: '+254 700 000 004',
    email: 'kilimani@mamaplus.co.ke',
    hours: 'Mon-Fri: 7:00 AM - 5:00 PM',
    position: { lat: -1.2921, lng: 36.7871 },
    description: 'Community-focused school providing quality education and maternal health workshops.'
  }
]

export default function LocationsPage() {
  const [view, setView] = useState<'map' | 'list'>('map')
  const [selectedSchool, setSelectedSchool] = useState<typeof schools[0] | null>(null)
  const [mapCenter] = useState({ lat: -1.2921, lng: 36.8219 })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  return (
    <div className="min-h-screen pt-32 pb-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 mt-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Locations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the MamaPlus school nearest to you. We have multiple locations across Nairobi
            to serve you better.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={view === 'map' ? 'default' : 'outline'}
            onClick={() => setView('map')}
            className="flex items-center gap-2"
          >
            <MapIcon className="h-4 w-4" />
            Map View
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            List View
          </Button>
        </div>

        {/* Map View */}
        {view === 'map' && (
          <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg border border-border">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  defaultCenter={mapCenter}
                  defaultZoom={12}
                  mapId="mamaplus-locations"
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                >
                  {schools.map((school) => (
                    <AdvancedMarker
                      key={school.id}
                      position={school.position}
                      onClick={() => setSelectedSchool(school)}
                    >
                      <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                        <MapPin className="h-6 w-6" />
                      </div>
                    </AdvancedMarker>
                  ))}

                  {selectedSchool && (
                    <InfoWindow
                      position={selectedSchool.position}
                      onCloseClick={() => setSelectedSchool(null)}
                    >
                      <div className="p-2 max-w-xs">
                        <h3 className="font-bold text-lg mb-2">{selectedSchool.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedSchool.description}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{selectedSchool.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{selectedSchool.phone}</span>
                          </div>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center p-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Google Maps API key not configured
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {schools.map((school) => (
              <Card key={school.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    {school.name}
                  </CardTitle>
                  <CardDescription>{school.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{school.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{school.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{school.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Hours</p>
                      <p className="text-sm text-muted-foreground">{school.hours}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => {
                      setView('map')
                      setSelectedSchool(school)
                    }}
                  >
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Can't Find a Location Near You?</CardTitle>
              <CardDescription>
                We're constantly expanding! Contact us to learn about upcoming locations
                or to suggest a new area for a MamaPlus school.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
