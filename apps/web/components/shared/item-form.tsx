"use client";

import React from "react";
import {
  IconCreditCard,
  IconEye,
  IconEyeOff,
  IconId,
  IconLogin2,
  IconNotes,
  IconSquareKey,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";

import { ItemFormProps, ItemFormValues } from "@repo/db/types";
import { ItemSchema } from "@repo/db/zod-schema";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@repo/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@repo/ui/components/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { cardBrands, months } from "@repo/ui/lib/utils";

const ItemForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save Item",
}: ItemFormProps) => {
  const [togglePrivateKey, setTogglePrivateKey] = React.useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      type: "login",
      note: "",
      isFavorite: false,
      username: "",
      password: "",
      url: "",
      otp: "",
      ...initialValues,
    } as ItemFormValues,
    validators: {
      onSubmit: ItemSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <form.Field
        name="type"
        children={(field) => (
          <Tabs
            value={field.state.value}
            onValueChange={(value) =>
              field.handleChange(value as ItemFormValues["type"])
            }
            className="w-full"
          >
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="login">
                <IconLogin2 />
                Login
              </TabsTrigger>
              <TabsTrigger value="card">
                <IconCreditCard />
                Card
              </TabsTrigger>
              <TabsTrigger value="identity">
                <IconId />
                Identity
              </TabsTrigger>
              <TabsTrigger value="note">
                <IconNotes />
                Note
              </TabsTrigger>
              <TabsTrigger value="ssh_key">
                <IconSquareKey />
                SSH Key
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 flex flex-col gap-4">
              <form.Field
                name="title"
                children={(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched &&
                      !!field.state.meta.errors.length
                    }
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    </FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. My Google Account"
                      />
                    </InputGroup>
                    <FieldError
                      errors={field.state.meta.errors.map((err) => ({
                        message: (err as any)?.message || String(err),
                      }))}
                    />
                  </Field>
                )}
              />

              <TabsContent value="login" className="mt-0 flex flex-col gap-4">
                <form.Field
                  name="username"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="password"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="url"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Website URL
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
              </TabsContent>

              <TabsContent value="card" className="mt-0 flex flex-col gap-4">
                <form.Field
                  name="cardholderName"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Cardholder Name
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="cardNumber"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            Card Number
                          </FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />

                  <form.Field
                    name="brand"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldLabel htmlFor={field.name}>Brand</FieldLabel>

                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {cardBrands.map((brand) => (
                              <SelectItem key={brand.value} value={brand.value}>
                                {brand.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />

                  <form.Field
                    name="expiryMonth"
                    children={(field) => (
                      <Field>
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            Expiry Month
                          </FieldLabel>
                        </FieldContent>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="expiryYear"
                    children={(field) => (
                      <Field>
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            Expiry Year
                          </FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            placeholder="YYYY"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />

                  <form.Field
                    name="cvv"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>CVV</FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="identity"
                className="mt-0 flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="identityTitle"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            Identity Title
                          </FieldLabel>
                        </FieldContent>

                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Identity Title" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mr">Mr</SelectItem>
                            <SelectItem value="mrs">Mrs</SelectItem>
                            <SelectItem value="ms">Ms</SelectItem>
                            <SelectItem value="dr">Dr</SelectItem>
                            <SelectItem value="mx">Mx</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="firstName"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            First Name
                          </FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="middleName"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            Middle Name
                          </FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="lastName"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            Last Name
                          </FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="username"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="company"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>Company</FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="socialSecurityNumber"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            Social Security Number
                          </FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="passportNumber"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            Passport Number
                          </FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="licenseNumber"
                    children={(field) => (
                      <Field className="col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            License Number
                          </FieldLabel>
                        </FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  />
                </div>
                <form.Field
                  name="email"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="phone"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="address_1"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Address Line 1
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="address_2"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Address Line 2
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="address_3"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Address Line 3
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="addressCity"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>City</FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="addressState"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>State</FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="addressZip"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Zip</FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="addressCountry"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
              </TabsContent>

              <TabsContent value="ssh_key" className="mt-0 flex flex-col gap-4">
                <form.Field
                  name="publicKey"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Public Key</FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="privateKey"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Private Key
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          type={togglePrivateKey ? "text" : "password"}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <InputGroupAddon align={"inline-end"}>
                          <InputGroupButton
                            onClick={() =>
                              setTogglePrivateKey(!togglePrivateKey)
                            }
                          >
                            {togglePrivateKey ? <IconEyeOff /> : <IconEye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  )}
                />
                <form.Field
                  name="fingerprint"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Fingerprint
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
              </TabsContent>

              <form.Field
                name="note"
                children={(field) => (
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
                    </FieldContent>
                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Any additional information..."
                      />
                    </InputGroup>
                  </Field>
                )}
              />

              <form.Field
                name="isFavorite"
                children={(field) => (
                  <Field
                    orientation="horizontal"
                    className="items-center justify-between"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Mark as Favorite
                      </FieldLabel>
                    </FieldContent>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                  </Field>
                )}
              />
            </div>
          </Tabs>
        )}
      />

      <div className="mt-4 flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !form.state.canSubmit}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;
