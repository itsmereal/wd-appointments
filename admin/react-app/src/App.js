import './styles/globals.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent } from './components/ui/card';
import { AppProvider } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import Dashboard from './pages/Dashboard';
import BookingForms from './pages/BookingForms';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <SettingsProvider>
        <div className="min-h-screen bg-background p-4">
          <Card className="mx-auto max-w-[1400px]">
            <CardContent className="p-6">
              <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="booking-forms">Booking Forms</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="space-y-4">
                  <Dashboard />
                </TabsContent>
                <TabsContent value="booking-forms" className="space-y-4">
                  <BookingForms />
                </TabsContent>
                <TabsContent value="appointments" className="space-y-4">
                  <Appointments />
                </TabsContent>
                <TabsContent value="settings" className="space-y-4">
                  <Settings />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </SettingsProvider>
    </AppProvider>
  );
}

export default App;
