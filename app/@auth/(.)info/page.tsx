'use client'

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      {/* <button
        onPress={() => {
          router.back()
        }}
      >
        Close modal
      </button>
      <div>test</div> */}

      <Modal isOpen={true}
        size='5xl'
        hideCloseButton={true}
        scrollBehavior="inside"
        placement='center'
        disableAnimation={true}
        
        // classNames={{
        //   base: "bg-black text-white"
        // }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
              <ModalBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                <p>
                  Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit
                  dolor adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis.
                  Velit duis sit officia eiusmod Lorem aliqua enim laboris do dolor eiusmod.
                  Et mollit incididunt nisi consectetur esse laborum eiusmod pariatur
                  proident Lorem eiusmod et. Culpa deserunt nostrud ad veniam.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={() => router.back()}>
                  Close
                </Button>
                <Button color="primary" onPress={() => router.back()}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}