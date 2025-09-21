import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import UserCard from "@/components/UserCard";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <div className="p-4 flex gap-4 flex-col">
      {/* CONTENIDO PRINCIPAL */}
      <div className="w-full flex flex-col gap-8">
        {/* TARJETAS DE USUARIO */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>
        {/* GRÁFICOS DEL MEDIO */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* GRÁFICO DE CONTEO */}
          <div className="w-full lg:w-1/2 h-[450px]">
            <CountChartContainer />
          </div>
          {/* GRÁFICO DE ASISTENCIA */}
          <div className="w-full lg:w-1/2 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
