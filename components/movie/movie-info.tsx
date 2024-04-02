import { getMovieDetail, getSeriseDetail } from "@/lib/themoviedb/api";
import { Button, ModalContent, ModalHeader, ModalBody, ModalFooter, Image } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function MovieInfo({ content }: { content: any }) {
  return (
    <>
      {content &&
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{content.title ? content.title : content.name}</ModalHeader>
              <ModalBody>
                <p>
                  <Image
                    isBlurred
                    removeWrapper
                    radius="none"
                    alt="Card background"
                    className="z-0 w-full h-full object-cover"
                    src={`https://image.tmdb.org/t/p/original/${content.backdrop_path}`}
                  />
                  {content.overview}
                  {/* {content} */}
                </p>
                <p>
                  {/* {JSON.stringify(content)} */}
                </p>
              </ModalBody>
              <ModalFooter>

              </ModalFooter>
            </>
          )}
        </ModalContent>
      }
    </>
  )
}