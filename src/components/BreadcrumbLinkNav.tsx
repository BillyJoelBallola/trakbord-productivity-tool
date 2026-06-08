"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getProject } from "@/actions/project.action";

type LabelMap = Record<string, string>;

export function BreadcrumbLinkNav() {
  const pathname = usePathname();

  const [dynamicLabels, setDynamicLabels] = useState<LabelMap>({});

  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname],
  );

  useEffect(() => {
    async function loadLabels() {
      const labels: LabelMap = {};

      const projectIndex = segments.indexOf("projects");

      if (projectIndex !== -1 && projectIndex + 1 < segments.length) {
        const projectId = segments[projectIndex + 1];

        try {
          const project = await getProject(projectId);

          if (project) {
            labels[projectId] = project.name;
          }
        } catch (error) {
          console.error(error);
        }
      }

      setDynamicLabels(labels);
    }

    loadLabels();
  }, [segments]);

  const formatLabel = (segment: string) =>
    segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <Breadcrumb className="mt-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/workspaces">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = dynamicLabels[segment] ?? formatLabel(segment);
          if (segment.includes("project")) return;

          return (
            <div key={href} className="contents">
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
