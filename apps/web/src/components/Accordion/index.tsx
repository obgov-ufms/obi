import React from "react";
import * as AccordionComponent from "@radix-ui/react-accordion";
import classNames from "classnames";
import { MdKeyboardArrowDown } from "react-icons/md";
import "./styles.css";

export function Accordion(props: {
  items: Array<{
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
    open?: boolean;
  }>;
}) {
  return (
    <AccordionComponent.Root
      className="AccordionRoot"
      type="multiple"
      defaultValue={props.items.filter(({ open }) => open).map(({ id }) => id)}
    >
      {props.items.map((item) => (
        <AccordionComponent.Item
          className="AccordionItem"
          value={item.id}
          key={item.id}
        >
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionComponent.Item>
      ))}
    </AccordionComponent.Root>
  );
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionComponent.Header className="AccordionHeader">
    <AccordionComponent.Trigger
      className={classNames("AccordionTrigger", className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <MdKeyboardArrowDown className="AccordionChevron" aria-hidden />
    </AccordionComponent.Trigger>
  </AccordionComponent.Header>
));

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionComponent.Content
    className={classNames("AccordionContent", className)}
    {...props}
    ref={forwardedRef}
  >
    <div className="AccordionContentText">{children}</div>
  </AccordionComponent.Content>
));

export default Accordion;
