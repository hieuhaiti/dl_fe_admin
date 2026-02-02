import React from "react";

interface ColorSwatchProps {
  name: string;
  bgClass: string;
  textClass?: string;
  description: string;
  usage?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  name,
  bgClass,
  textClass,
  description,
  usage,
}) => (
  <div className="flex items-center gap-3 p-2 rounded-lg border">
    <div className={`w-12 h-12 rounded-md shadow-sm border ${bgClass}`} />
    <div className="flex-1">
      <p className={`font-medium text-sm ${textClass || ""}`}>{name}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      {usage && (
        <p className="text-xs text-primary/80 mt-1 italic">📌 {usage}</p>
      )}
    </div>
  </div>
);

interface ColorSectionProps {
  title: string;
  children: React.ReactNode;
}

const ColorSection: React.FC<ColorSectionProps> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="font-semibold text-lg border-b pb-2">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  </div>
);

export default function ColorTest() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🎨 Admin Theme - Trust Blue</h1>
        <p className="text-muted-foreground mb-8">
          Test tất cả các màu CSS được định nghĩa trong index.css - Theme xanh
          dương tin cậy cho Admin Dashboard
        </p>

        {/* Base Colors */}
        <ColorSection title="Base Colors">
          <ColorSwatch
            name="Background"
            bgClass="bg-background"
            description="--background"
            usage="Nền Slate-50 - Sáng nhẹ, lạnh, hiện đại"
          />
          <ColorSwatch
            name="Foreground"
            bgClass="bg-foreground"
            description="--foreground"
            usage="Chữ Slate-900 - Đậm, rõ ràng, dễ đọc"
          />
        </ColorSection>

        {/* Primary & Secondary */}
        <ColorSection title="Primary & Secondary">
          <ColorSwatch
            name="Primary"
            bgClass="bg-primary"
            description="--primary"
            usage="Trust Blue - Nút chính, CTA, links"
          />
          <ColorSwatch
            name="Primary Foreground"
            bgClass="bg-primary-foreground"
            description="--primary-foreground"
            usage="Chữ trắng trên nền primary"
          />
          <ColorSwatch
            name="Secondary"
            bgClass="bg-secondary"
            description="--secondary"
            usage="Slate-100 - Nút phụ, inactive states"
          />
          <ColorSwatch
            name="Secondary Foreground"
            bgClass="bg-secondary-foreground"
            description="--secondary-foreground"
            usage="Chữ đậm trên nền secondary"
          />
        </ColorSection>

        {/* Card & Popover */}
        <ColorSection title="Card & Popover">
          <ColorSwatch
            name="Card"
            bgClass="bg-card"
            description="--card"
            usage="White - Nổi bật trên nền Slate"
          />
          <ColorSwatch
            name="Card Foreground"
            bgClass="bg-card-foreground"
            description="--card-foreground"
            usage="Chữ trong card"
          />
          <ColorSwatch
            name="Popover"
            bgClass="bg-popover"
            description="--popover"
            usage="Dropdown, modal, tooltip"
          />
          <ColorSwatch
            name="Popover Foreground"
            bgClass="bg-popover-foreground"
            description="--popover-foreground"
            usage="Chữ trong popover"
          />
        </ColorSection>

        {/* Muted & Accent */}
        <ColorSection title="Muted & Accent">
          <ColorSwatch
            name="Muted"
            bgClass="bg-muted"
            description="--muted"
            usage="Nền vô hiệu hóa, disabled states"
          />
          <ColorSwatch
            name="Muted Foreground"
            bgClass="bg-muted-foreground"
            description="--muted-foreground"
            usage="Slate-500 - Text phụ, placeholder"
          />
          <ColorSwatch
            name="Accent"
            bgClass="bg-accent"
            description="--accent"
            usage="Hover state, selection highlight"
          />
          <ColorSwatch
            name="Accent Foreground"
            bgClass="bg-accent-foreground"
            description="--accent-foreground"
            usage="Chữ trên nền accent"
          />
        </ColorSection>

        {/* Semantic Colors */}
        <ColorSection title="Semantic Colors">
          <ColorSwatch
            name="Destructive"
            bgClass="bg-destructive"
            description="--destructive"
            usage="Red-500 - Xóa, lỗi, cảnh báo nghiêm trọng"
          />
          <ColorSwatch
            name="Destructive Foreground"
            bgClass="bg-destructive-foreground"
            description="--destructive-foreground"
            usage="Chữ trên nền destructive"
          />
          <ColorSwatch
            name="Success"
            bgClass="bg-success"
            description="--success"
            usage="Green-600 - Hoàn thành, xác nhận"
          />
          <ColorSwatch
            name="Success Foreground"
            bgClass="bg-success-foreground"
            description="--success-foreground"
            usage="Chữ trên nền success"
          />
          <ColorSwatch
            name="Warning"
            bgClass="bg-warning"
            description="--warning"
            usage="Amber-500 - Cảnh báo, cần chú ý"
          />
          <ColorSwatch
            name="Warning Foreground"
            bgClass="bg-warning-foreground"
            description="--warning-foreground"
            usage="Chữ trên nền warning"
          />
          <ColorSwatch
            name="Info"
            bgClass="bg-info"
            description="--info"
            usage="Sky-500 - Thông tin, hướng dẫn"
          />
          <ColorSwatch
            name="Info Foreground"
            bgClass="bg-info-foreground"
            description="--info-foreground"
            usage="Chữ trên nền info"
          />
        </ColorSection>

        {/* Borders & Inputs */}
        <ColorSection title="Borders & Inputs">
          <ColorSwatch
            name="Border"
            bgClass="bg-border"
            description="--border"
            usage="Slate-200 - Viền các thành phần"
          />
          <ColorSwatch
            name="Input"
            bgClass="bg-input"
            description="--input"
            usage="Viền input, select, textarea"
          />
          <ColorSwatch
            name="Ring"
            bgClass="bg-ring"
            description="--ring"
            usage="Focus ring - Trùng màu Primary"
          />
        </ColorSection>

        {/* Chart Colors */}
        <ColorSection title="Chart Colors - Data Visualization">
          <ColorSwatch
            name="Chart 1"
            bgClass="bg-chart-1"
            description="--chart-1"
            usage="Primary Blue - Dữ liệu chính"
          />
          <ColorSwatch
            name="Chart 2"
            bgClass="bg-chart-2"
            description="--chart-2"
            usage="Teal - Dữ liệu bổ trợ tin cậy"
          />
          <ColorSwatch
            name="Chart 3"
            bgClass="bg-chart-3"
            description="--chart-3"
            usage="Dark Navy - Dữ liệu nền"
          />
          <ColorSwatch
            name="Chart 4"
            bgClass="bg-chart-4"
            description="--chart-4"
            usage="Soft Yellow - Điểm nhấn"
          />
          <ColorSwatch
            name="Chart 5"
            bgClass="bg-chart-5"
            description="--chart-5"
            usage="Soft Orange - Cảnh báo trong chart"
          />
        </ColorSection>

        {/* Sidebar Colors */}
        <ColorSection title="Sidebar Colors - Dark Theme">
          <ColorSwatch
            name="Sidebar Background"
            bgClass="bg-sidebar-background"
            description="--sidebar-background"
            usage="Dark Slate - Sidebar chuyên nghiệp"
          />
          <ColorSwatch
            name="Sidebar Foreground"
            bgClass="bg-sidebar-foreground"
            description="--sidebar-foreground"
            usage="Chữ sáng trong sidebar"
          />
          <ColorSwatch
            name="Sidebar Primary"
            bgClass="bg-sidebar-primary"
            description="--sidebar-primary"
            usage="Item active trong sidebar"
          />
          <ColorSwatch
            name="Sidebar Primary Foreground"
            bgClass="bg-sidebar-primary-foreground"
            description="--sidebar-primary-foreground"
            usage="Chữ item active"
          />
          <ColorSwatch
            name="Sidebar Accent"
            bgClass="bg-sidebar-accent"
            description="--sidebar-accent"
            usage="Slate-800 - Hover trong sidebar"
          />
          <ColorSwatch
            name="Sidebar Accent Foreground"
            bgClass="bg-sidebar-accent-foreground"
            description="--sidebar-accent-foreground"
            usage="Chữ khi hover"
          />
          <ColorSwatch
            name="Sidebar Border"
            bgClass="bg-sidebar-border"
            description="--sidebar-border"
            usage="Viền tối trong sidebar"
          />
          <ColorSwatch
            name="Sidebar Ring"
            bgClass="bg-sidebar-ring"
            description="--sidebar-ring"
            usage="Focus ring trong sidebar"
          />
        </ColorSection>

        {/* Button Examples */}
        <div className="space-y-3 mt-8">
          <h3 className="font-semibold text-lg border-b pb-2">
            Button Examples
          </h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Primary
            </button>
            <button className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity">
              Secondary
            </button>
            <button className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity">
              Destructive
            </button>
            <button className="px-4 py-2 rounded-md bg-success text-success-foreground hover:opacity-90 transition-opacity">
              Success
            </button>
            <button className="px-4 py-2 rounded-md bg-warning text-warning-foreground hover:opacity-90 transition-opacity">
              Warning
            </button>
            <button className="px-4 py-2 rounded-md bg-info text-info-foreground hover:opacity-90 transition-opacity">
              Info
            </button>
            <button className="px-4 py-2 rounded-md bg-muted text-muted-foreground hover:opacity-90 transition-opacity">
              Muted
            </button>
            <button className="px-4 py-2 rounded-md bg-accent text-accent-foreground hover:opacity-90 transition-opacity border">
              Accent
            </button>
          </div>
        </div>

        {/* Card Examples */}
        <div className="space-y-3 mt-8">
          <h3 className="font-semibold text-lg border-b pb-2">Card Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card text-card-foreground border shadow-sm">
              <h4 className="font-semibold">Card Default</h4>
              <p className="text-muted-foreground text-sm mt-1">
                Dashboard card với nền trắng
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary text-primary-foreground shadow-sm">
              <h4 className="font-semibold">Card Primary</h4>
              <p className="opacity-80 text-sm mt-1">
                Card nổi bật với Trust Blue
              </p>
            </div>
            <div className="p-4 rounded-lg bg-sidebar-background text-sidebar-foreground shadow-sm">
              <h4 className="font-semibold">Card Dark</h4>
              <p className="opacity-80 text-sm mt-1">
                Card với theme sidebar tối
              </p>
            </div>
          </div>
        </div>

        {/* Alert Examples */}
        <div className="space-y-3 mt-8">
          <h3 className="font-semibold text-lg border-b pb-2">
            Alert Examples
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <strong>Error:</strong> Đã xảy ra lỗi khi xử lý yêu cầu
            </div>
            <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-success">
              <strong>Success:</strong> Dữ liệu đã được lưu thành công
            </div>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-warning">
              <strong>Warning:</strong> Phiên làm việc sắp hết hạn
            </div>
            <div className="p-4 rounded-lg bg-info/10 border border-info/20 text-info">
              <strong>Info:</strong> Có 3 thông báo mới chờ xử lý
            </div>
          </div>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-3 mt-8">
          <h3 className="font-semibold text-lg border-b pb-2">
            Sidebar Preview
          </h3>
          <div className="flex gap-4">
            <div className="w-64 bg-sidebar-background text-sidebar-foreground rounded-lg p-4 space-y-2">
              <div className="font-semibold text-sidebar-primary-foreground bg-sidebar-primary px-3 py-2 rounded">
                📊 Dashboard
              </div>
              <div className="px-3 py-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer transition-colors">
                👥 Users
              </div>
              <div className="px-3 py-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer transition-colors">
                📝 Content
              </div>
              <div className="px-3 py-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer transition-colors">
                ⚙️ Settings
              </div>
              <div className="border-t border-sidebar-border my-2"></div>
              <div className="px-3 py-2 rounded text-destructive cursor-pointer">
                🚪 Logout
              </div>
            </div>
            <div className="flex-1 bg-card border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Main Content Area</h4>
              <p className="text-muted-foreground text-sm">
                Đây là vùng nội dung chính của dashboard. Sidebar bên trái sử
                dụng theme tối để tạo sự tách biệt rõ ràng với nội dung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
